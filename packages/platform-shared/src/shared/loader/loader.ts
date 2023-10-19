import invariant from '@shuvi/utils/invariant';
import { IRouteMatch, IPageRouteRecord } from '../routerTypes';
import {
  Response,
  json as createJson,
  redirect as createRedirect,
  response,
  isResponse
} from '../response';
import {
  Loader,
  LoaderContextOptions,
  LoaderDataRecord,
  IRouteLoaderContext
} from './types';

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
      `redirect's frist argument should be string, now is ${typeof to}`
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

export function createLoaderContext({
  pathname,
  query,
  params,
  req,
  getAppContext
}: LoaderContextOptions): IRouteLoaderContext {
  return {
    pathname,
    params,
    query,
    redirect: redirectHelper,
    error: errorHelper,
    appContext: getAppContext(),
    ...(req ? { req } : {})
  };
}

export async function runLoaders(
  matches: IRouteMatch<IPageRouteRecord>[],
  loadersByRouteId: Record<string, Loader>,
  loaderContext: IRouteLoaderContext
): Promise<LoaderDataRecord> {
  const loaderDatas: LoaderDataRecord = {};

  if (!matches.length) {
    return loaderDatas;
  }

  const createLoader = (match: IRouteMatch<IPageRouteRecord>) => async () => {
    const loaderFn = loadersByRouteId[match.route.id];
    if (typeof loaderFn !== 'function') {
      return;
    }
    let res: Response | undefined;
    let error: any;
    try {
      const value = await loaderFn(loaderContext);

      if (value === undefined) {
        error = new Error(
          `You defined a loader for route "${match.route.path}" but didn't return ` +
            `anything from your \`loader\` function. Please return a value or \`null\`.`
        );
      } else {
        res = createJson(value);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development' && !isResponse(err)) {
        console.error(
          `error occurs in loader function of route "${match.route.path}"`
        );
      }
      error = err;
    }

    if (error) {
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
    invariant(
      item.result,
      `loader function of route "${matches[index].route.path}" should return a value`
    );
    loaderDatas[routeId] = item.result.data;
  }

  return loaderDatas;
}
