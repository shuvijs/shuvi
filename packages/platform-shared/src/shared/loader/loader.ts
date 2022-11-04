import invariant from '@shuvi/utils/lib/invariant';
import { IRouteMatch, IPageRouteRecord } from '../routerTypes';
import {
  Response,
  json as createJson,
  redirect as createRedirect,
  response,
  isResponse
} from '../response';
import { Loader, LoaderContextOptions, LoaderDataRecord } from './types';

interface Result<T> {
  error?: unknown;
  result?: T;
}

// todo: add unit tests
export async function runInParallerAndBail<T>(
  fns: Array<() => Promise<T> | T>
): Promise<Result<T>[]> {
  return new Promise<Result<T>[]>(resolve => {
    const resultList: Result<T>[] = [];
    let total = fns.length;
    let finishedNum = 0;
    let finished = new Map<number, boolean>();
    let abort = false;

    const doResolve = () => {
      abort = true;
      resolve(resultList.slice());
    };
    const isAllFinishedBefore = (targetIndex: number) => {
      for (let i = 0; i < targetIndex; i++) {
        if (!finished.has(i)) {
          return false;
        }
      }
      return true;
    };

    // call loaders in parallel
    fns.map(async (fn, index) => {
      let result: T | undefined;
      let error: unknown | undefined;
      try {
        result = await fn();
      } catch (err: unknown) {
        error = err;
      }

      if (abort) return;

      resultList[index] = {
        error,
        result
      };
      finishedNum += 1;
      finished.set(index, true);

      if (finishedNum === total) {
        doResolve();
      } else if (finishedNum === index + 1 && isAllFinishedBefore(index)) {
        if (error) {
          // we can bail
          doResolve();
        }
      }
    });
  });
}

function redirectHelper(to: string, status: number = 302) {
  if (process.env.NODE_ENV === 'development') {
    invariant(
      typeof to === 'string',
      `redirect fist argument should be string, now is ${typeof to}`
    );
  }

  throw createRedirect(to, status);
}

function errorHelper(msg?: string, statusCode: number = 500) {
  invariant(
    statusCode >= 400 && statusCode < 600,
    'status code should be 4xx and 5xx'
  );

  throw response(msg, { status: statusCode });
}

export async function runLoaders(
  matches: IRouteMatch<IPageRouteRecord>[],
  loadersByRouteId: Record<string, Loader>,
  { query, req, getAppContext }: LoaderContextOptions
): Promise<LoaderDataRecord> {
  const loaderDatas: LoaderDataRecord = {};

  if (!matches.length) {
    return loaderDatas;
  }

  const appContext = getAppContext();
  const createLoader = (match: IRouteMatch<IPageRouteRecord>) => async () => {
    const loaderFn = loadersByRouteId[match.route.id];
    if (typeof loaderFn !== 'function') {
      return;
    }
    let res: Response | undefined;
    try {
      const value = await loaderFn({
        pathname: match.pathname,
        params: match.params,
        query: query,
        redirect: redirectHelper,
        error: errorHelper,
        appContext,
        ...(req ? { req } : {})
      });

      if (value === undefined) {
        throw new Error(
          `You defined a loader for route "${match.route.path}" but didn't return ` +
            `anything from your \`loader\` function. Please return a value or \`null\`.`
        );
      }

      res = createJson(value);
    } catch (error) {
      if (process.env.NODE_ENV === 'development' && !isResponse(error)) {
        console.error(`loader function error of route "${match.route.path}"`);
      }
      throw error;
    }

    return res;
  };

  // call loaders in parallel
  const resultList = await runInParallerAndBail(matches.map(createLoader));

  for (let index = 0; index < resultList.length; index++) {
    const item = resultList[index];
    if (item.error) {
      throw item.error;
    }

    const routeId = matches[index].route.id;
    if (item.result) {
      loaderDatas[routeId] = item.result.data;
    } else {
      // allow return undefined
      loaderDatas[routeId] = undefined;
    }
  }

  return loaderDatas;
}
