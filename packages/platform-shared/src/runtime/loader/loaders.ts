import { IRoute, IRouteMatch } from '@shuvi/router';
import isEqual from '@shuvi/utils/lib/isEqual';
import { IRouteLoaderContext, ILoaderOptions, LoaderFn } from './types';
import { IPageRouteRecord } from '../routerTypes';
import * as response from '../response';

export function getInvalidRoutes(
  loaders: Record<string, LoaderFn>,
  to: IRoute<IPageRouteRecord>,
  from: IRoute<IPageRouteRecord>
): IPageRouteRecord[] {
  const toMatches: IRouteMatch<IPageRouteRecord>[] = to.matches || [];
  const fromMatches: (IRouteMatch<IPageRouteRecord> | undefined)[] =
    from.matches || [];
  let changedMatches: IRouteMatch<IPageRouteRecord>[] = [];

  /**
   * When a navigation is triggered, loaders should run in the following situation:
   * 1. If a route changed (new route or same dynamic route but different params), its loader and all its children's loaders should run.
   * 2. Last nested route's loader should always run.
   */
  for (let i = 0; i < toMatches.length; i++) {
    const currentToMatch = toMatches[i];
    const currentFromMatch = fromMatches[i];
    // new route
    if (currentToMatch.route.id !== currentFromMatch?.route.id) {
      changedMatches.push(...toMatches.slice(i));
      break;
      // same route but different params
    } else if (!isEqual(currentToMatch.params, currentFromMatch?.params)) {
      changedMatches.push(...toMatches.slice(i));
      break;
    }
    // last nested route (last match)
    if (i === toMatches.length - 1) {
      changedMatches.push(currentToMatch);
    }
  }

  const targets: IPageRouteRecord[] = [];
  changedMatches.forEach(match => {
    const id: string = match.route.id;
    if (loaders[id]) {
      targets.push(match.route);
    }
  });

  return targets;
}

export async function runLoaders(
  loaders: Record<string, LoaderFn>,
  routes: IPageRouteRecord[],
  context: IRouteLoaderContext,
  loaderOptions: ILoaderOptions
): Promise<{
  datas: response.Response[];
  redirect?: response.Response;
  error?: response.Response;
}> {
  const { sequential } = loaderOptions;

  const runLoader = async (route: IPageRouteRecord) => {
    const loader = loaders[route.id];
    let resp: any;
    try {
      resp = await loader(context);
    } catch (error: any) {
      return response.error({
        message: `loader of route: "${route.path}" fails.\n${error.message}`
      });
    }

    if (response.isResponse(resp)) {
      return resp;
    }

    return response.json(resp || {});
  };

  let datas: response.Response[] = [];
  let error: response.Response | undefined;
  let redirect: response.Response | undefined;
  const runSequence = async () => {
    // call loaders in sequence
    for (const route of routes) {
      const resp = await runLoader(route);
      if (response.isRedirect(resp)) {
        redirect = resp;
        break;
      }

      if (response.isError(resp)) {
        error = resp;
        break;
      }

      datas.push(resp);
    }
  };

  const runParallel = async () => {
    // call loaders in sequence
    datas = await Promise.all(routes.map(route => runLoader(route)));
    for (let index = 0; index < datas.length; index++) {
      const resp = datas[index];
      if (response.isRedirect(resp)) {
        redirect = resp;
        break;
      }

      if (response.isError(resp)) {
        error = resp;
        break;
      }

      datas.push(resp);
    }
  };

  await (sequential ? runSequence() : runParallel());

  return {
    datas,
    redirect,
    error
  };
}
