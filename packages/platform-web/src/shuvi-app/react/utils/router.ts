import { IRoute, IRouteMatch, NavigationGuardHook } from '@shuvi/router';
import {
  getErrorHandler,
  errorModel,
  IModelManager,
  IPageRouteRecord,
  IAppContext
} from '@shuvi/platform-shared/esm/runtime';
import { getRedirector } from '@shuvi/platform-shared/lib/runtime/context/routeLoaderContext';
import isEqual from '@shuvi/utils/lib/isEqual';
import { createError, IPageErrorHandler } from './createError';
import pageLoaders from '@shuvi/app/files/page-loaders';
import {
  getLoaderManager,
  Loader,
  LoaderReject
} from '../loader/loaderManager';
import { ILoaderOptions } from '@shuvi/service/lib/core';

const isServer = typeof window === 'undefined';

export type INormalizeRoutesContext = IAppContext;

type IPageRouteWithElement = IPageRouteRecord & { element?: any };

let loaders = pageLoaders;
let currentErrorComp: IPageErrorHandler;
let currentTo: IRoute<any>;

/**
 * ErrorComp is reused at route `resolve` hook and `beforeResolve` hook during the same route transition.
 * So it needs to be reset at every new route transition.
 */
const resetErrorComp = (newTo: IRoute<any>) => {
  if (!currentTo || currentTo !== newTo) {
    currentTo = newTo;
    currentErrorComp = createError();
  }
};

export const getLoadersHook =
  (
    appContext: INormalizeRoutesContext,
    loaderOptions: ILoaderOptions,
    modelManager: IModelManager
  ): NavigationGuardHook =>
  async (to, from, next) => {
    const toMatches: IRouteMatch<IPageRouteRecord>[] = to.matches;
    const fromMatches: (IRouteMatch<IPageRouteRecord> | undefined)[] =
      from.matches;
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
    const loaderGenerator = (routeId: string, to: IRoute<any>) => async () => {
      const loaderFn = loaders[routeId];
      if (typeof loaderFn === 'function') {
        return await loaderFn({
          isServer,
          pathname: to.pathname,
          query: to.query,
          params: to.params,
          appContext,
          redirect: redirector.handler,
          error: isServer ? error.errorHandler : currentErrorComp.handler
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
    const { sequential } = loaderOptions;
    const executeLoaders = async () => {
      // call loaders in sequence
      if (sequential) {
        for (const loader of targetLoaders) {
          // initialData must not null if hydrating
          if (shouldHydrate) {
            if (loader.result.error) {
              await loader.load(true);
            }
          } else {
            try {
              await loader?.load(true);
            } catch (e) {
              loaderManager.rejecteds.push((e as LoaderReject).id);
              next();
            }
          }
        }
      } else {
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
          loaderManager.rejecteds.push((e as LoaderReject).id);
          next();
        });
      }
    };
    await executeLoaders();
    if (!isServer) {
      // handle redirect
      if (redirector.redirected) {
        next(redirector.state!.path);
        redirector.reset();
      }

      if (currentErrorComp?.errorCode !== undefined) {
        error.errorHandler(
          currentErrorComp.errorCode,
          currentErrorComp.errorDesc
        );
      } else {
        error.reset();
      }
    }
    loaderManager.notifyLoaders(targetIds);
    next();
  };

export function normalizeRoutes(
  routes: IPageRouteRecord[] | undefined
): IPageRouteWithElement[] {
  if (!routes) {
    return [] as IPageRouteWithElement[];
  }

  return routes.map((route: IPageRouteRecord) => {
    const res: IPageRouteWithElement = {
      ...route
    };

    const { component } = res;
    if (component) {
      res.resolve = async (to, _from, next) => {
        if (isServer) {
          return next();
        }

        resetErrorComp(to);
        const preload = component.preload;
        if (preload) {
          try {
            await preload();
          } catch (err) {
            console.error(err);
            currentErrorComp.handler(500);
            return next();
          }
        }
        next();
      };
    }
    res.children = normalizeRoutes(res.children);
    return res;
  });
}

if (module.hot) {
  module.hot.accept('@shuvi/app/files/page-loaders', () => {
    loaders = require('@shuvi/app/files/page-loaders').default;
  });
}
