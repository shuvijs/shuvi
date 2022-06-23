import { createPlugin } from '@shuvi/service';
import { getMiddlewareRoutes } from '@shuvi/platform-shared/lib/node';
import { getRoutesContentFromRawRoutes } from './lib';
import { isDirectory } from '@shuvi/utils/lib/file';
import { IRouteRecord } from '@shuvi/router';
import { IMiddlewareRouteConfig } from './lib/routes';

export { middleware as getPageMiddleware } from './lib/middleware';

export default createPlugin({
  addRuntimeFile: async ({ createFile }, context) => {
    const name = 'middlewareRoutes.js';
    const {
      config: { routes },
      paths
    } = context;

    const hasConfigRoutes = Array.isArray(routes);

    if (hasConfigRoutes) {
      return [
        createFile({
          name,
          content: () => {
            return getRoutesContentFromRawRoutes(
              routes as IMiddlewareRouteConfig[],
              paths.pagesDir
            );
          }
        })
      ];
    }

    return [
      createFile({
        name,
        content: async () => {
          const hasRoutesDir: boolean = await isDirectory(paths.routesDir);
          let rawRoutes: IRouteRecord[] = [];

          if (hasRoutesDir) {
            const { routes, warnings } = await getMiddlewareRoutes(
              paths.routesDir
            );
            warnings.forEach(warning => {
              console.warn(warning);
            });
            rawRoutes = routes;
          }

          return getRoutesContentFromRawRoutes(
            rawRoutes as IMiddlewareRouteConfig[],
            paths.routesDir
          );
        },
        dependencies: paths.routesDir
      })
    ];
  }
});
