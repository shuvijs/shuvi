import { createPlugin } from '@shuvi/service';
import { getApiRoutes } from '@shuvi/platform-shared/lib/node';
import { getRoutesContent, getRoutesContentFromRawRoutes } from './lib';

export { IApiRequestHandler } from './lib/apiRouteHandler';

export { middleware as getApiMiddleware } from './lib';

export default createPlugin({
  addRuntimeFile: async ({ createFile }, context) => {
    const {
      config: { apiRoutes },
      paths
    } = context;

    return [
      createFile({
        name: 'apiRoutes.js',
        content: async () => {
          const hasConfigRoutes = Array.isArray(apiRoutes);

          if (hasConfigRoutes) {
            return getRoutesContent(apiRoutes, paths.apisDir);
          }

          const { routes, warnings } = await getApiRoutes(paths.routesDir);

          warnings.forEach(warning => {
            console.warn(warning);
          });

          return getRoutesContentFromRawRoutes(routes, paths.routesDir);
        },
        dependencies: paths.routesDir
      })
    ];
  }
});
