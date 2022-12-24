import { IMiddlewareRouteConfig } from '@shuvi/platform-shared/node';
import { normalizePath } from '@shuvi/utils/file';

export { IMiddlewareRouteConfig };

export function normalizeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[],
  option: { baseDir: string }
): IMiddlewareRouteConfig[] {
  const res: IMiddlewareRouteConfig[] = [];
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const middlewareRoute = { ...middlewareRoutes[index] };
    if (middlewareRoute.middleware) {
      middlewareRoute.middleware = normalizePath(
        middlewareRoute.middleware,
        option.baseDir
      );
    }

    res.push(middlewareRoute);
  }

  return res;
}

export function serializeMiddlewareRoutes(
  middlewareRoutes: IMiddlewareRouteConfig[]
): string {
  let res = '';
  for (let index = 0; index < middlewareRoutes.length; index++) {
    const { middleware, path } = middlewareRoutes[index];
    let strRoute = `\n{
      path: "${path}",
      ${middleware ? `middleware: require("${middleware}"),` : ''}
    },`;
    res += strRoute;
  }
  return `[${res}]`;
}

export function generateRoutesContent(
  rawRoutes: IMiddlewareRouteConfig[],
  {
    baseDir
  }: {
    baseDir: string;
  }
): string {
  const serialized = serializeMiddlewareRoutes(
    normalizeMiddlewareRoutes(rawRoutes, { baseDir })
  );
  return `export default ${serialized}`;
}
