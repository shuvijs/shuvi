import {
  IPageRouteRecord,
  IClientAppContext
} from '@shuvi/platform-shared/esm/runtime';

const isServer = typeof window === 'undefined';

export type INormalizeRoutesContext = IClientAppContext;

type IPageRouteWithElement = IPageRouteRecord & { element?: any };

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

        const preload = component.preload;

        if (preload) {
          try {
            // todo: move to loader
            await preload();
          } catch (err) {
            // todo: handle error
            console.error(err);
          }
        }

        next();
      };
    }
    res.children = normalizeRoutes(res.children);
    return res;
  });
}
