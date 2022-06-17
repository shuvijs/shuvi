import { createRedirector, IRoute } from '@shuvi/router';
import {
  getErrorHandler,
  getModelManager,
  errorModel,
  IRouteLoaderContext,
  IPageRouteRecord,
  IClientAppContext,
  IRouteData
} from '@shuvi/platform-shared/esm/runtime';
import { createError } from './createError';
import { getInitialPropsDeprecatingMessage } from './errorMessage';
import pageLoaders from '@shuvi/app/files/page-loaders';
import { getLoaderManager } from '../loader/loaderManager';
const isServer = typeof window === 'undefined';

export type INormalizeRoutesContext = IClientAppContext;

type IPageRouteWithElement = IPageRouteRecord & { element?: any };

let hydrated: { [x: string]: boolean } = {};

export function resetHydratedState() {
  hydrated = {};
}

let loaders = pageLoaders;

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
      res.resolve = async (to, from, next, context) => {
        if (isServer) {
          return next();
        }

        const modelManager = getModelManager();
        const loaderManager = getLoaderManager();
        const { initialLoadersData } = loaderManager;

        // support both getInitialProps and loader
        const shouldHydrated =
          (routeProps[id] !== undefined || initialLoadersData[id]) &&
          !hydrated[id];
        if (shouldHydrated) {
          const { hasError } = modelManager.get(errorModel).$state();
          if (hasError) {
            hydrated[id] = true; // hydrated error page, run Component.getInitialProps by client
            return next();
          }
        }

        let Component: any;
        const preload = component.preload;
        const errorComp = createError();

        const redirector = createRedirector();
        const loaderGenerator =
          (routeId: string, to: IRoute<any>) => async () => {
            const loaderFn = loaders[routeId];
            if (typeof loaderFn === 'function') {
              return await loaderFn({
                isServer: false,
                pathname: to.pathname,
                query: to.query,
                params: to.params,
                appContext,
                redirect: redirector.handler,
                error: errorComp.handler
              });
            }
          };
        if (loaders[id]) {
          const loaderManager = getLoaderManager();
          const loader = loaderManager.add(loaderGenerator(id, to), id);
          if (shouldHydrated) {
            hydrated[id] = true;
            if (initialLoadersData[id].error) {
              loader.load();
            }
          } else {
            loader.load();
          }
        }
        if (preload) {
          try {
            const preloadComponent = await preload();
            Component = preloadComponent.default || preloadComponent;
          } catch (err) {
            console.error(err);
            errorComp.handler(500);
            Component = function () {
              return null;
            };
          }
        } else {
          Component = component;
        }
        if (Component.getInitialProps) {
          console.warn(getInitialPropsDeprecatingMessage);
          if (shouldHydrated) {
            // only hydrated once, use server state
            hydrated[id] = true;
            context.props = routeProps[id];
            return next();
          } else {
            context.props = await Component.getInitialProps({
              isServer: false,
              query: to.query,
              pathname: to.pathname,
              params: to.params,
              redirect: redirector.handler,
              error: errorComp.handler,
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
        const error = getErrorHandler(modelManager);
        if (errorComp.errorCode !== undefined) {
          error.errorHandler(errorComp.errorCode, errorComp.errorDesc);
        } else {
          error.reset();
        }

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
