import { IRoute, IRouteMatch, NavigationGuardHook } from '@shuvi/router';
import {
  getErrorHandler,
  getModelManager,
  errorModel,
  IModelManager,
  IRouteLoaderContext,
  IPageRouteRecord,
  IAppContext,
  IRouteData
} from '@shuvi/platform-shared/esm/runtime';
import { getRedirector } from '@shuvi/platform-shared/lib/runtime/context/routeLoaderContext';
import isEqual from '@shuvi/utils/lib/isEqual';
import { createError, IPageErrorHandler } from './createError';
import { getInitialPropsDeprecatingMessage } from './errorMessage';
import pageLoaders from '@shuvi/app/files/page-loaders';
import { getLoaderManager, Loader } from '../loader/loaderManager';
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
            if (loader?.result.error) {
              await loader.load(true);
            }
          } else {
            await loader?.load(true);
          }
        }
      } else {
        // call loaders in parallel
        await Promise.all(
          targetLoaders
            .filter(loader => {
              // skip when hydrating and no error
              if (shouldHydrate && !loader?.result.error) {
                return false;
              }
              return true;
            })
            .map(loader => loader?.load(true))
        );
      }
    };
    await executeLoaders();
    if (!isServer) {
      // handle redirect
      if (redirector.redirected) {
        next(redirector.state!.path);
        redirector.reset();
      }

      // handle error
      const error = getErrorHandler(modelManager);
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
  routes: IPageRouteRecord[] | undefined,
  appContext: INormalizeRoutesContext = {},
  routeData?: IRouteData
): IPageRouteWithElement[] {
  const routeProps = routeData?.routeProps || {};
  if (!routes) {
    return [] as IPageRouteWithElement[];
  }

  return routes.map((route: IPageRouteRecord) => {
    const res: IPageRouteWithElement = {
      ...route
    };

    const { id, component } = res;
    if (component) {
      res.resolve = async (to, _from, next, context) => {
        resetErrorComp(to);
        if (isServer) {
          return next();
        }
        const modelManager = getModelManager();

        // support both getInitialProps and loader
        const loaderManager = getLoaderManager();
        const { shouldHydrate } = loaderManager;
        if (shouldHydrate) {
          const { hasError } = modelManager.get(errorModel).$state();
          if (hasError) {
            // hydrated error page, run Component.getInitialProps by client
            return next();
          }
        }
        let Component: any;
        const preload = component.preload;

        const redirector = getRedirector(modelManager);
        if (preload) {
          try {
            const preloadComponent = await preload();
            Component = preloadComponent.default || preloadComponent;
          } catch (err) {
            console.error(err);
            currentErrorComp.handler(500);
            Component = function () {
              return null;
            };
          }
        } else {
          Component = component;
        }
        if (Component.getInitialProps) {
          console.warn(getInitialPropsDeprecatingMessage);
          if (shouldHydrate) {
            // only hydrated once, use server state
            context.props = routeProps[id];
            return next();
          } else {
            context.props = await Component.getInitialProps({
              isServer: false,
              query: to.query,
              pathname: to.pathname,
              params: to.params,
              redirect: redirector.handler,
              error: currentErrorComp.handler,
              appContext
            } as IRouteLoaderContext);

            if (redirector.redirected) {
              next(redirector.state!.path);
              return;
            }
          }
        }
        // not reset at method private _doTransition to Avoid splash screen，eg：
        // /a special query a=1, trigger page 500 error
        // in error page link=>/b when click link trigger error store reset() right now
        // reset() make errorPage hide error and show /a page (splash screen)
        // the splash time is lazy load /b
        // route /b and component load show page /b
        /* const error = getErrorHandler(modelManager);
        console.log('errorComp resolve')
        if (errorComp.errorCode !== undefined) {
          error.errorHandler(errorComp.errorCode, errorComp.errorDesc);
        } else {
          error.reset();
        } */
        next();
      };
    }
    res.children = normalizeRoutes(res.children, appContext, routeData);
    return res;
  });
}

if (module.hot) {
  module.hot.accept('@shuvi/app/files/page-loaders', () => {
    loaders = require('@shuvi/app/files/page-loaders').default;
  });
}
