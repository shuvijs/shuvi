import { createRedirector } from '@shuvi/router';
import {
  getErrorHandler,
  getAppStore,
  IRouteComponentContext,
  IAppRouteConfig,
  IApplicationCreaterBase
} from '@shuvi/platform-core';
import { createError } from './createError';

const isServer = typeof window === 'undefined';

export type INormalizeRoutesContext = IApplicationCreaterBase;

type IAppRouteWithElement = IAppRouteConfig & { element?: any };

let hydrated: { [x: string]: boolean } = {};

export function resetHydratedState() {
  hydrated = {};
}

export function normalizeRoutes(
  routes: IAppRouteConfig[] | undefined,
  appContext: INormalizeRoutesContext = {}
): IAppRouteWithElement[] {
  const { routeProps = {} } = appContext;
  if (!routes) {
    return [] as IAppRouteWithElement[];
  }

  return routes.map((route: IAppRouteConfig) => {
    const res: IAppRouteWithElement = {
      ...route
    };

    const { id, component } = res;
    if (component) {
      res.resolve = async (to, from, next, context) => {
        if (isServer) {
          return next();
        }

        let Component: any;
        const preload = component.preload;
        const error = getErrorHandler(getAppStore());
        if (preload) {
          try {
            const preloadComponent = await preload();
            Component = preloadComponent.default || preloadComponent;
          } catch (err) {
            console.error(err);
            error.errorHandler();
            Component = function () {
              return null;
            };
          }
        } else {
          Component = component;
        }
        const errorComp = createError();
        if (Component.getInitialProps) {
          if (routeProps[id] !== undefined && !hydrated[id]) {
            // only hydrated once
            hydrated[id] = true;
            context.props = routeProps[id];
            return next();
          } else {
            const redirector = createRedirector();
            context.props = await Component.getInitialProps({
              isServer: false,
              query: to.query,
              pathname: to.pathname,
              params: to.params,
              redirect: redirector.handler,
              error: errorComp.handler,
              appContext
            } as IRouteComponentContext);

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
        if (errorComp.errorCode !== undefined) {
          error.errorHandler(errorComp.errorCode, errorComp.errorDesc);
        } else {
          error.reset();
        }

        next();
      };
    }
    res.children = normalizeRoutes(res.children, appContext);
    return res;
  });
}
