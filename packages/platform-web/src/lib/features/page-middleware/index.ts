import { createPlugin } from '@shuvi/service';
import { getMiddlewareRoutes } from '@shuvi/platform-shared/lib/node';
import { getRoutesContentFromRawRoutes } from './lib';
import { isDirectory } from '@shuvi/utils/lib/file';

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
            return getRoutesContentFromRawRoutes(routes, paths.pagesDir);
          }
        })
      ];
    }

    const hasRoutesDir: boolean = await isDirectory(paths.routesDir);

    if (hasRoutesDir) {
      return [
        createFile({
          name,
          content: async () => {
            const rawRoutes = await getMiddlewareRoutes(paths.routesDir);
            console.log(
              rawRoutes,
              getRoutesContentFromRawRoutes(rawRoutes, paths.routesDir)
            );
            return getRoutesContentFromRawRoutes(rawRoutes, paths.routesDir);
          },
          dependencies: paths.routesDir
        })
      ];
    }

    return [];
  }
});
