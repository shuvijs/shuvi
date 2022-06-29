import { createHash } from 'crypto';
import { IUserRouteConfig, IRouteConfig } from '@shuvi/service';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import { normalizedAbsolutePath } from '@shuvi/utils/lib/file';

export { IUserRouteConfig };

type RouteKeysWithoutChildren = keyof Omit<IUserRouteConfig, 'children'>;

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

/**
 * returns JSON string of IRawPageRouteRecord
 */
export function serializeRoutes(routes: IRouteConfig[]): string {
  let res = '';
  for (let index = 0; index < routes.length; index++) {
    const { children: childRoutes, ...route } = routes[index];
    const id = route.id;
    let strRoute = '';
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index] as RouteKeysWithoutChildren;

      if (key === 'component') {
        const { component } = route;
        const componentSource = component;
        const componentSourceWithAffix = `${componentSource}?${ROUTE_RESOURCE_QUERYSTRING}`;
        // `webpackExports` works with production and optimization.minimize, check compiled dist
        strRoute +=
          `__componentSourceWithAffix__: "${componentSourceWithAffix}",
__componentSource__: "${componentSource}",
__import__: () => import(
  /* webpackChunkName: "page-${id}" */
  /* webpackExports: "default" */
  "${componentSourceWithAffix}"),
__resolveWeak__: () => [require.resolveWeak("${componentSourceWithAffix}")]`.trim();
      } else {
        strRoute += `${key}: ${JSON.stringify(route[key])}`;
      }
      strRoute += `,\n`;
    }

    if (childRoutes && childRoutes.length > 0) {
      strRoute += `children: ${serializeRoutes(childRoutes)},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function normalizeRoutes(
  routes: (IUserRouteConfig | IUserRouteConfig)[],
  componentDir: string,
  parentPath: string = ''
): IRouteConfig[] {
  const res: IRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] } as IRouteConfig;
    const pathWithSlash = /^\//.test(route.path) ? route.path : route.path;
    const fullpath = pathWithSlash ? parentPath + pathWithSlash : parentPath;
    route.id = genRouteId(fullpath);
    if (route.component) {
      route.component = normalizedAbsolutePath(route.component, componentDir);
    }

    if (route.children && route.children.length > 0) {
      route.children = normalizeRoutes(route.children, componentDir, fullpath);
    }
    res.push(route);
  }
  return res;
}

export const generateRoutesContent = (routes: IRouteConfig[]): string => {
  const serialized = serializeRoutes(routes);
  return `export default ${serialized}`;
};
