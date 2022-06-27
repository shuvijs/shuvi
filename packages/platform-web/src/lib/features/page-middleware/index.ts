import { createPlugin } from '@shuvi/service';
import { getMiddlewareRoutes } from '@shuvi/platform-shared/lib/node';
import { getRoutesContentFromRawRoutes } from './lib';
import { IMiddlewareRouteConfig } from './lib/routes';

export { middleware as getPageMiddleware } from './lib/middleware';

export default createPlugin({
  addRuntimeFile: async ({ createFile }, context) => {
    const name = 'middlewareRoutes.js';
    const {
      config: { routes: routesFromConfig },
      paths
    } = context;

    return [
      createFile({
        name,
        content: async () => {
          let routes: IMiddlewareRouteConfig[];
          const hasConfigRoutes = Array.isArray(routesFromConfig);

          if (hasConfigRoutes) {
            routes = routesFromConfig as IMiddlewareRouteConfig[];
          } else {
            const { routes: _routes, warnings } = await getMiddlewareRoutes(
              paths.routesDir
            );
            warnings.forEach(warning => {
              console.warn(warning);
            });
            routes = _routes;
          }

          return getRoutesContentFromRawRoutes(routes, paths.routesDir);
        },
        dependencies: paths.routesDir
      })
    ];
  }
});
