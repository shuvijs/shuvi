import { createRedirector } from '@shuvi/router';
import {
  getErrorHandler,
  getModelManager,
  errorModel,
  IRouteComponentContext,
  IAppRouteConfig,
  IApplicationCreaterClientContext
} from '@shuvi/platform-shared/esm/runtime';
import { createError } from './createError';
import { getInitialPropsDeprecatingMessage } from './errorMessage';

const isServer = typeof window === 'undefined';

export type INormalizeRoutesContext = IApplicationCreaterClientContext;

type IAppRouteWithElement = IAppRouteConfig & { element?: any };

let hydrated: { [x: string]: boolean } = {};

export function resetHydratedState() {
  hydrated = {};
}

export function normalizeRoutes(
  routes: IAppRouteConfig[] | undefined,
  appContext: INormalizeRoutesContext = {}
): IAppRouteWithElement[] {
  const { routeProps = {}, loadersData = {} } = appContext;
  if (!routes) {
    return [] as IAppRouteWithElement[];
  }

  return routes.map((route: IAppRouteConfig) => {
    const res: IAppRouteWithElement = {
      ...route
    };

    const { id, fullPath, component } = res;
    if (component) {
      res.resolve = async (to, from, next, context) => {
        if (isServer) {
          return next();
        }

        const modelManager = getModelManager();
        // support both getInitialProps and loader
        const shouldHydrated =
          (routeProps[id] !== undefined || loadersData[fullPath as string]) &&
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
          console.error(getInitialPropsDeprecatingMessage);
          if (shouldHydrated) {
            // only hydrated once, use server state
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
        const error = getErrorHandler(modelManager);
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
