import { createHash } from 'crypto';
import path from 'path';
import {
  IPageRouteConfig,
  INormalizedPageRouteConfig
} from '@shuvi/platform-shared/shared';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/constants';
import { normalizePath, removeExt } from '@shuvi/utils/file';
import { resolvePkgFile } from '../../../paths';

export { IPageRouteConfig };

type RouteKeysWithoutChildren = keyof Omit<IPageRouteConfig, 'children'>;

const EmptyComponnetPath = resolvePkgFile(
  'lib/node/features/filesystem-routes/page/EmptyPageComponent'
);

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

/**
 * returns JSON string of INormalizedPageRouteConfig
 */
export function serializeRoutes(
  routes: INormalizedPageRouteConfig[],
  {
    includeMeta,
    useEmptyComponent
  }: {
    includeMeta: boolean;
    useEmptyComponent?: boolean;
  }
): string {
  let res = '';
  for (let index = 0; index < routes.length; index++) {
    const { children: childRoutes, ...route } = routes[index];
    let strRoute = '';
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index] as RouteKeysWithoutChildren;

      if (key === 'component') {
        const { component, id } = route;
        const componentSource = removeExt(component!);
        let componentRequest = `${componentSource}?${ROUTE_RESOURCE_QUERYSTRING}`;
        // `webpackExports` works with production and optimization.minimize, check compiled dist
        if (includeMeta) {
          strRoute += `__componentRawRequest__: "${componentRequest}",\n`;
          strRoute += `__componentSource__: "${componentSource}",\n`;
        }

        if (useEmptyComponent) {
          componentRequest = EmptyComponnetPath;
        }
        const fileExtension = path.extname(component!);
        const fileName = path.basename(component!, fileExtension);
        strRoute += `
__import__: () => import(
  /* webpackChunkName: "${fileName}-${id}" */
  /* webpackExports: "default" */
  "${componentRequest}"),
__resolveWeak__: () => [require.resolveWeak("${componentRequest}")]`.trim();
      } else {
        strRoute += `${key}: ${JSON.stringify(route[key])}`;
      }
      strRoute += `,\n`;
    }

    if (childRoutes && childRoutes.length > 0) {
      strRoute += `children: ${serializeRoutes(childRoutes, {
        includeMeta,
        useEmptyComponent
      })},\n`;
    }

    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function normalizeRoutes(
  routes: IPageRouteConfig[],
  componentDir: string,
  parentPath: string = ''
): INormalizedPageRouteConfig[] {
  const res: INormalizedPageRouteConfig[] = [];
  for (let index = 0; index < routes.length; index++) {
    const route = { ...routes[index] } as INormalizedPageRouteConfig;
    const { component, path } = route;
    const pathWithoutSlash = path.replace(/^\//, '').replace(/\/$/, '');
    const fullpath = parentPath + '/' + pathWithoutSlash;

    route.id = genRouteId(`${fullpath}@${route.component}`);
    if (component) {
      route.component = normalizePath(component, componentDir);
    }
    if (route.children && route.children.length > 0) {
      route.children = normalizeRoutes(
        route.children,
        componentDir,
        parentPath + '/' + pathWithoutSlash
      );
    }

    res.push(route);
  }
  return res;
}

export const generateRoutesContent = (
  routes: INormalizedPageRouteConfig[],
  {
    dev,
    ssr
  }: {
    dev: boolean;
    ssr: boolean;
  }
): string => {
  const serverRoutes = serializeRoutes(routes, {
    includeMeta: true,
    useEmptyComponent: ssr === false
  });
  const clientRoutes = serializeRoutes(routes, {
    includeMeta: dev
  });

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
