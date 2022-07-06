import { IRouteMatch, IPageRouteRecord } from '../routerTypes';
import {
  Response,
  isResponse,
  json as createJson,
  error as createError,
  redirect as createRedirect,
  isError,
  isRedirect
} from '../response';
import { Loader, LoaderContextOptions, LoaderDataRecord } from './types';

// todo: add unit tests
export async function runInParallerAndBail<T>(
  fns: Array<() => Promise<T> | T>
) {
  return new Promise<T[]>(resolve => {
    const result: T[] = [];
    let total = fns.length;
    let finishedNum = 0;
    let finished = new Map<number, boolean>();
    let abort = false;

    const doResolve = () => {
      abort = true;
      resolve(result.slice());
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
      const value = await fn();

      if (abort) return;

      result[index] = value;
      finishedNum += 1;
      finished.set(index, true);

      if (finishedNum === total) {
        doResolve();
      } else if (finishedNum === index + 1 && isAllFinishedBefore(index)) {
        if (isRedirect(value) || isError(value)) {
          // we have a response of bailed type
          doResolve();
        }
      }
    });
  });
}

export async function runLoaders(
  matches: IRouteMatch<IPageRouteRecord>[],
  loadersByRouteId: Record<string, Loader>,
  { isServer, query, req, appContext }: LoaderContextOptions
): Promise<Response | LoaderDataRecord> {
  if (!matches.length) {
    return [];
  }

  const ctx = appContext();
  const createLoader = (match: IRouteMatch<IPageRouteRecord>) => async () => {
    const loaderFn = loadersByRouteId[match.route.id];
    let res: Response | undefined;
    try {
      const value = await loaderFn({
        isServer,
        pathname: match.pathname,
        params: match.params,
        query: query,
        redirect: createRedirect,
        error: createError,
        appContext: ctx,
        ...(req ? { req } : {})
      });
      if (isResponse(value)) {
        res = value;
      } else if (value) {
        res = createJson(value);
      }
    } catch (error) {
      let errorMessage = `loader function error of route "${match.route.path}"`;
      console.error(errorMessage);
      console.error(error);
      res = createError();
    }

    return res;
  };

  // call loaders in parallel
  const resultList = await runInParallerAndBail(matches.map(createLoader));
  const loaderDatas: LoaderDataRecord = {};

  for (let index = 0; index < resultList.length; index++) {
    const item = resultList[index];
    if (isRedirect(item)) {
      return item;
    }

    if (isError(item)) {
      return item;
    }

    const routeId = matches[index].route.id;
    if (item) {
      loaderDatas[routeId] = (item as Response).data;
    } else {
      // allow return undefined
      loaderDatas[routeId] = undefined;
    }
  }

  return loaderDatas;
}
