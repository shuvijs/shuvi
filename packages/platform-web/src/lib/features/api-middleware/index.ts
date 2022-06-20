import { createPlugin } from '@shuvi/service';
import { getApiRoutes } from '@shuvi/platform-shared/lib/node';
import { getRoutesContent, getRoutesContentFromRawRoutes } from './lib';
import { isDirectory } from '@shuvi/utils/lib/file';

export { IApiRequestHandler } from './lib/apiRouteHandler';

export { middleware as getApiMiddleware } from './lib';

export default createPlugin({
  addRuntimeFile: async ({ createFile }, context) => {
    const name = 'apiRoutes.js';

    const {
      config: { apiRoutes, apiConfig },
      paths
    } = context;
    const { prefix } = apiConfig;

    const hasConfigRoutes = Array.isArray(apiRoutes);

    if (hasConfigRoutes) {
      return [
        createFile({
          name,
          content: () => getRoutesContent(apiRoutes, paths.apisDir, prefix)
        })
      ];
    }

    const hasRoutesDir: boolean = await isDirectory(paths.routesDir);

    if (hasRoutesDir) {
      return createFile({
        name,
        content: async () => {
          const rawRoutes = await getApiRoutes(paths.routesDir);
          return getRoutesContentFromRawRoutes(rawRoutes, paths.routesDir);
        },
        dependencies: paths.routesDir
      });
    }

    return [];
  }
});
