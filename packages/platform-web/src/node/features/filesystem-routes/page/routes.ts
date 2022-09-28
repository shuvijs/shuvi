import { createHash } from 'crypto';
import {
  IPageRouteConfig,
  IPageRouteConfigWithId
} from '@shuvi/platform-shared/shared';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import { normalizePath } from '@shuvi/utils/lib/file';

export { IPageRouteConfig };

type RouteKeysWithoutChildren = keyof Omit<IPageRouteConfig, 'children'>;

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

/**
 * returns JSON string of IPageRouteConfigWithId
 */
export function serializeRoutes(
  routes: IPageRouteConfigWithId[],
  includeMeta: boolean
): string {
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
        const componentRequest = `${componentSource}?${ROUTE_RESOURCE_QUERYSTRING}`;
        // `webpackExports` works with production and optimization.minimize, check compiled dist
        if (includeMeta) {
          strRoute += `__componentRawRequest__: "${componentRequest}",\n`;
          strRoute += `__componentSource__: "${componentSource}",\n`;
        }

        strRoute += `
__import__: () => import(
  /* webpackChunkName: "page-${id}" */
  /* webpackExports: "default" */
  "${componentRequest}"),
__resolveWeak__: () => [require.resolveWeak("${componentRequest}")]`.trim();
      } else {
        strRoute += `${key}: ${JSON.stringify(route[key])}`;
      }
      strRoute += `,\n`;
    }

    if (childRoutes && childRoutes.length > 0) {
      strRoute += `children: ${serializeRoutes(childRoutes, includeMeta)},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function normalizeRoutes(
  routes: IPageRouteConfig[],
  componentDir: string,
  parentPath: string = ''
): IPageRouteConfigWithId[] {
  const res: IPageRouteConfigWithId[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] } as IPageRouteConfigWithId;
    const pathWithoutSlash = route.path.replace(/^\//, '').replace(/\/$/, '');
    const fullpath = parentPath + '/' + pathWithoutSlash;
    if (route.component) {
      route.component = normalizePath(route.component, componentDir);
    }

    // todo: add origin file to gen id
    route.id = genRouteId(`${fullpath}@${route.component}`);

    if (route.children && route.children.length > 0) {
      route.children = normalizeRoutes(route.children, componentDir, fullpath);
    }
    res.push(route);
  }
  return res;
}

export const generateRoutesContent = (
  routes: IPageRouteConfigWithId[],
  isDev: boolean
): string => {
  const serverRoutes = serializeRoutes(routes, true);
  const clientRoutes = serializeRoutes(routes, isDev);

  return `
let routes;

if (typeof window === 'undefined') {
  routes = ${serverRoutes}
} else {
  routes = ${clientRoutes}
}

export default routes
`;
};
