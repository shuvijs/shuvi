import { Runtime } from '@shuvi/types';
import { createRedirector } from '../utils/createRedirector';

const isServer = typeof window === 'undefined';

type Data = Record<string, any>;

interface IRenderRouteOptions {
  routeProps?: Data;
  appContext: Data;
}

type IAppRouteWithElement = Runtime.IAppRouteConfig & { element?: any };
type IRouteComponentContext = Runtime.IRouteComponentContext;

let hydrated: { [x: string]: boolean } = {};

export function resetHydratedState() {
  hydrated = {};
}

export function normalizeRoutes(
  routes: Runtime.IAppRouteConfig[] | undefined,
  options: IRenderRouteOptions
): IAppRouteWithElement[] {
  const { routeProps = {}, appContext } = options;
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
        const preload = component.preload;
        if (isServer) {
          return next();
        }

        let Component: any;
        if (component.preload) {
          const preloadComponent = await preload();
          Component = preloadComponent.default || preloadComponent;
        } else {
          Component = component;
        }
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
              appContext
            } as IRouteComponentContext);

            if (redirector.redirected) {
              next(redirector.state!.path);
              return;
            }
          }
        }

        next();
      };
    }
    res.children = normalizeRoutes(res.children, options);
    return res;
  });
}
