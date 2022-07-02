import { IRoute, IRouteMatch, NavigationGuardHook } from '@shuvi/router';
import {
  getErrorHandler,
  errorModel,
  IModelManager,
  IRequest,
  IPageRouteRecord,
  IAppContext
} from '@shuvi/platform-shared/esm/runtime';
import isEqual from '@shuvi/utils/lib/isEqual';
import { createError, getRedirector } from './loaderContext';
import pageLoaders from '@shuvi/app/files/page-loaders';
import { getLoaderManager, Loader, LoaderReject } from './loaderManager';

const isServer = typeof window === 'undefined';

let loaders = pageLoaders;

export const getLoadersAndPreloadHook =
  (
    modelManager: IModelManager,
    { req, getAppContext }: { req?: IRequest; getAppContext: () => IAppContext }
  ): NavigationGuardHook =>
  async (to, from, next) => {
    const errorComp = createError();
    const toMatches: IRouteMatch<IPageRouteRecord>[] = to.matches;
    const fromMatches: (IRouteMatch<IPageRouteRecord> | undefined)[] =
      from.matches;
    let changedMatches: IRouteMatch<IPageRouteRecord>[] = [];
    // preload route components
    const preloadAll: Promise<any>[] = [];
    toMatches.forEach(match => {
      const preload = match.route.component?.preload;
      if (preload && typeof preload === 'function') {
        preloadAll.push(preload());
      }
    });
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
    const loaderManager = getLoaderManager();
    const { shouldHydrate } = loaderManager;
    if (shouldHydrate) {
      const { hasError } = modelManager.get(errorModel).$state();
      if (hasError) {
        // hydrated error page, run Component.getInitialProps by client
        return next();
      }
    }
    const error = getErrorHandler(modelManager);
    const redirector = getRedirector(modelManager);
    const appContext = getAppContext();
    const loaderGenerator = (routeId: string, to: IRoute<any>) => async () => {
      const loaderFn = loaders[routeId];
      if (typeof loaderFn === 'function') {
        return await loaderFn({
          isServer,
          pathname: to.pathname,
          query: to.query,
          params: to.params,
          redirect: redirector.handler,
          error: isServer ? error.errorHandler : errorComp.handler,
          appContext,
          ...(req ? { req } : {})
        });
      }
    };

    const targetIds: string[] = [];
    const targetLoaders: Loader[] = [];
    changedMatches.forEach(match => {
      const id: string = match.route.id;
      if (loaders[id]) {
        targetIds.push(id);
        targetLoaders.push(loaderManager.add(loaderGenerator(id, to), id));
      }
    });
    const executeLoaders = async () => {
      // call loaders in parallel
      await Promise.all(
        targetLoaders
          .filter(loader => {
            // skip when hydrating and no error
            if (shouldHydrate && !loader.result.error) {
              return false;
            }
            return true;
          })
          .map(loader => loader?.load(true))
      ).catch(e => {
        console.error('run loader failed', e);
        loaderManager.rejecteds.push((e as LoaderReject).id);
        next();
      });
    };
    try {
      await Promise.all([executeLoaders(), ...preloadAll]);
    } catch (e) {
      // executeLoaders won't reject
      // if these code is invoked, that must be error with preload
      console.error(e);
      errorComp.handler(500);
    }
    if (!isServer) {
      // handle redirect
      if (redirector.redirected) {
        next(redirector.state!.path);
        redirector.reset();
      }

      if (errorComp?.errorCode !== undefined) {
        error.errorHandler(errorComp.errorCode, errorComp.errorDesc);
      } else {
        error.reset();
      }
    }
    loaderManager.notifyLoaders(targetIds);
    next();
  };

if (module.hot) {
  module.hot.accept('@shuvi/app/files/page-loaders', () => {
    loaders = require('@shuvi/app/files/page-loaders').default;
  });
}
