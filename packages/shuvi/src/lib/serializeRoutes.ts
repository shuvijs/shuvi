import { createHash } from 'crypto';
import { IRouteConfig } from '@shuvi/core';
import { ROUTE_RESOURCE_QUERYSTRING } from '../constants';
import { runtime } from '../runtime';

function genRouteId(filepath: string) {
  return createHash('md4').update(filepath).digest('hex').substr(0, 4);
}

function serializeRoutesImpl(
  routes: IRouteConfig[],
  parentPath: string = ''
): string {
  let res = '';
  for (let index = 0; index < routes.length; index++) {
    const { routes: childRoutes, ...route } = routes[index];
    const fullpath = route.path ? parentPath + '/' + route.path : parentPath;
    const id = genRouteId(fullpath);

    if (childRoutes && childRoutes.length > 0) {
      serializeRoutesImpl(childRoutes, fullpath);
    }

    let strRoute = `id: ${JSON.stringify(id)},\n`;
    const keys = Object.keys(route);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (key === 'componentFile') {
        strRoute += `component: `;
        strRoute += runtime.componentTemplate(
          `${route[key]}?${ROUTE_RESOURCE_QUERYSTRING}`,
          { ...route, id }
        );
      } else {
        strRoute += `${key}: `;
        strRoute += JSON.stringify(route[key]);
      }

      strRoute += `,\n`;
    }
    res += `{${strRoute}},\n`;
  }

  return `[${res}]`;
}

export function serializeRoutes(routes: IRouteConfig[]): string {
  return serializeRoutesImpl(routes, '');
}
