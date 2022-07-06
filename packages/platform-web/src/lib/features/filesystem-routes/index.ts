import { createPlugin } from '@shuvi/service';
import {
  getPageRoutes,
  getApiRoutes,
  getMiddlewareRoutes
} from '@shuvi/platform-shared/lib/node';
import {
  getRoutes,
  setRoutes,
  normalizeRoutes as normalizePageRoutes,
  IUserRouteConfig,
  generateRoutesContent as generatePageRoutesContent
} from './page';
import {
  middleware as getMiddlewareMiddleware,
  generateRoutesContent as generateMiddlewareRoutesContent,
  IMiddlewareRouteConfig
} from './middleware';
import {
  IApiRequestHandler,
  middleware as getApiMiddleware,
  generateRoutesContent as generateApiRoutesContent,
  IApiRouteConfig
} from './api';

export {
  IApiRequestHandler,
  getRoutes,
  getMiddlewareMiddleware,
  getApiMiddleware
};

let routes: IUserRouteConfig[];

export default createPlugin({
  appRoutes(_routes) {
    routes = _routes;
    return routes;
  },
  addRuntimeFile: async ({ createFile }, context) => {
    const {
      config: { routes: pageRoutes, middlewareRoutes, apiRoutes },
      paths,
      pluginRunner
    } = context;

    const getRoutesAfterPlugin = (routes: IUserRouteConfig[]) =>
      pluginRunner.appRoutes(routes);

    const pageRoutesFile = createFile({
      name: 'routes.js',
      content: async () => {
        let routes: IUserRouteConfig[];
        const hasConfigRoutes = Array.isArray(pageRoutes);
        if (hasConfigRoutes) {
          routes = pageRoutes as IUserRouteConfig[];
        } else {
          const { routes: _routes, warnings } = await getPageRoutes(
            paths.routesDir
          );
          warnings.forEach(warning => {
            console.warn(warning.msg);
          });
          routes = _routes;
        }

        const modifiedRoutes = getRoutesAfterPlugin(routes);
        const normalizedRoutes = normalizePageRoutes(
          modifiedRoutes,
          paths.routesDir
        );
        setRoutes(normalizedRoutes);
        return generatePageRoutesContent(normalizedRoutes);
      },
      dependencies: paths.routesDir
    });

    const apiRoutesFile = createFile({
      name: 'apiRoutes.js',
      content: async () => {
        let routes: IApiRouteConfig[] = [];
        const hasConfigRoutes = Array.isArray(apiRoutes);
        if (hasConfigRoutes) {
          routes = apiRoutes;
        } else {
          const { routes: _routes, warnings } = await getApiRoutes(
            paths.routesDir
          );
          warnings.forEach(warning => {
            console.warn(warning);
          });
          routes = _routes;
        }

        return generateApiRoutesContent(routes, paths.routesDir);
      },
      dependencies: paths.routesDir
    });
    const middlewareRoutesFile = createFile({
      name: 'middlewareRoutes.js',
      content: async () => {
        let routes: IMiddlewareRouteConfig[];
        const hasConfigRoutes = Array.isArray(middlewareRoutes);
        if (hasConfigRoutes) {
          routes = middlewareRoutes;
        } else {
          const { routes: _routes, warnings } = await getMiddlewareRoutes(
            paths.routesDir
          );
          warnings.forEach(warning => {
            console.warn(warning);
          });
          routes = _routes;
        }
        return generateMiddlewareRoutesContent(routes, paths.routesDir);
      },
      dependencies: paths.routesDir
    });

    return [pageRoutesFile, apiRoutesFile, middlewareRoutesFile];
  }
});
