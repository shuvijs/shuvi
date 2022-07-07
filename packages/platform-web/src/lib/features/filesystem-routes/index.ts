import { createPlugin, IRouteConfig } from '@shuvi/service';
import {
  getPageRoutes,
  getApiRoutes,
  getMiddlewareRoutes
} from '@shuvi/platform-shared/lib/node';
import * as fs from 'fs';
import * as path from 'path';
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
import { ifComponentHasLoader } from '../html-render/lib';
import { buildToString } from '@shuvi/toolpack/lib/utils/build-loaders';

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
  addRuntimeFile: async ({ defineFile }, context) => {
    const {
      config: { routes: pageRoutes, middlewareRoutes, apiRoutes },
      paths,
      pluginRunner
    } = context;

    const getRoutesAfterPlugin = (routes: IUserRouteConfig[]) =>
      pluginRunner.appRoutes(routes);

    const pageRoutesFile = defineFile({
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
      dependencies: [paths.routesDir]
    });

    const apiRoutesFile = defineFile({
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
      dependencies: [paths.routesDir]
    });
    const middlewareRoutesFile = defineFile({
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
      dependencies: [paths.routesDir]
    });

    const loadersFile = defineFile({
      name: 'loaders.js',
      content: async () => {
        const routes = getRoutes();
        const loaders: Record<string, string> = {};
        const traverseRoutes = (routes: IRouteConfig[]) => {
          routes.forEach(r => {
            const { component, id, children } = r;
            if (component && id) {
              const hasLoader = ifComponentHasLoader(component);
              if (hasLoader) {
                loaders[id] = component;
              }
            }
            if (children) {
              traverseRoutes(children);
            }
          });
        };
        traverseRoutes(routes);
        let imports = '';
        let exports = '';
        Object.entries(loaders).forEach((loader, index) => {
          const [id, component] = loader;
          imports += `import { loader as loader_${index} } from '${component}'\n`;
          exports += `'${id}': loader_${index},\n`;
        });
        return `${imports}  export default {\n  ${exports}\n}`;
      },
      dependencies: [pageRoutesFile]
    });
    const loadersFileName = path.join(
      context.paths.appDir,
      'files',
      'loaders.js'
    );
    const pageLoadersFile = defineFile({
      name: 'page-loaders.js',
      content: async () => {
        if (fs.existsSync(loadersFileName)) {
          return await buildToString(loadersFileName);
        }
        return '';
      },
      dependencies: [loadersFile]
    });

    return [
      pageRoutesFile,
      apiRoutesFile,
      middlewareRoutesFile,
      loadersFile,
      pageLoadersFile
    ];
  }
});
