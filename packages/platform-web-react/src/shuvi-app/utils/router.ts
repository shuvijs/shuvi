import { Runtime } from '@shuvi/service';
import { createRedirector, clientErrorStore, createError } from '@shuvi/router';

const isServer = typeof window === 'undefined';

export type INormalizeRoutesContext = Runtime.IApplicationCreaterContext;

type IAppRouteWithElement = Runtime.IAppRouteConfig & { element?: any };
type IRouteComponentContext = Runtime.IRouteComponentContext;

let hydrated: { [x: string]: boolean } = {};

export function resetHydratedState() {
  hydrated = {};
}

export function normalizeRoutes(
  routes: Runtime.IAppRouteConfig[] | undefined,
  appContext: INormalizeRoutesContext = {}
): IAppRouteWithElement[] {
  const { routeProps = {} } = appContext;
  if (!routes) {
    return [] as IAppRouteWithElement[];
  }

  return routes.map((route: Runtime.IAppRouteConfig) => {
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
        if (preload) {
          try {
            const preloadComponent = await preload();
            Component = preloadComponent.default || preloadComponent;
          } catch (err) {
            console.error(err);
            clientErrorStore.errorHandler();
            Component = function () {
              return null;
            };
          }
        } else {
          Component = component;
        }
        const error = createError();
        if (Component.getInitialProps) {
          if (routeProps[id] !== undefined && !hydrated[id]) {
            // only hydrated once
            hydrated[id] = true;
            context.props = routeProps[id];
          } else {
            const redirector = createRedirector();
            context.props = await Component.getInitialProps({
              isServer: false,
              query: to.query,
              pathname: to.pathname,
              params: to.params,
              redirect: redirector.handler,
              error: error.handler,
              appContext
            } as IRouteComponentContext);

            if (redirector.redirected) {
              next(redirector.state!.path);
              return;
            }
          }
        }
        // not reset at method private _doTransition to Avoid splash screen
        if (error.errorCode !== undefined) {
          clientErrorStore.errorHandler(error.errorCode, error.errorDesc);
        } else {
          clientErrorStore.reset();
        }

        next();
      };
    }
    res.children = normalizeRoutes(res.children, appContext);
    return res;
  });
}
