import * as fs from 'fs';
import * as path from 'path';
import { buildToString } from '@shuvi/toolpack/lib/utils/build-loaders';
import { createPlugin } from '@shuvi/service';
import {
  getPageRoutes,
  getApiRoutes,
  getMiddlewareRoutes,
  IPageRouteConfig,
  IMiddlewareRouteConfig,
  IApiRouteConfig
} from '@shuvi/platform-shared/node';
import { IPageRouteConfigWithId } from '@shuvi/platform-shared/shared';
import { ifComponentHasLoader } from '../html-render/lib';
import { addRoutes, addMiddlewareRoutes } from './hooks';
import {
  getRoutes,
  setRoutes,
  normalizeRoutes as normalizePageRoutes,
  generateRoutesContent as generatePageRoutesContent
} from './page';
import {
  middleware as getMiddlewareMiddleware,
  generateRoutesContent as generateMiddlewareRoutesContent
} from './middleware';
import {
  IApiRequestHandler,
  middleware as getApiMiddleware,
  generateRoutesContent as generateApiRoutesContent
} from './api';

export {
  IApiRequestHandler,
  getRoutes,
  getMiddlewareMiddleware,
  getApiMiddleware
};

const plugin = createPlugin({
  setup: ({ addHooks }) => {
    addHooks({ addRoutes, addMiddlewareRoutes });
  },
  addRuntimeFile: async ({ defineFile }, context) => {
    const {
      config: {
        routes: pageRoutes,
        middlewareRoutes,
        apiRoutes,
        conventionRoutes
      },
      paths,
      pluginRunner,
      phase
    } = context;
    const isBuildPhase = phase === 'PHASE_PRODUCTION_BUILD';

    const pageRoutesFile = defineFile({
      name: 'routes.js',
      content: async () => {
        let routes: IPageRouteConfig[];
        const hasConfigRoutes = Array.isArray(pageRoutes);
        if (hasConfigRoutes) {
          routes = pageRoutes as IPageRouteConfig[];
        } else {
          const { routes: _routes, warnings } = await getPageRoutes(
            paths.routesDir,
            conventionRoutes.exclude
          );

          if (isBuildPhase) {
            warnings.forEach(warning => {
              console.warn(warning.msg);
            });
          }

          routes = _routes;
        }

        const extraRoutes = (await pluginRunner.addRoutes()).flat();
        const normalizedRoutes = normalizePageRoutes(
          // user routes come later
          extraRoutes.concat(routes),
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
        let routes: IApiRouteConfig[];
        const hasConfigRoutes = Array.isArray(apiRoutes);
        if (hasConfigRoutes) {
          routes = apiRoutes;
        } else {
          const { routes: _routes, warnings } = await getApiRoutes(
            paths.routesDir,
            conventionRoutes.exclude
          );

          if (isBuildPhase) {
            warnings.forEach(warning => {
              console.warn(warning);
            });
          }

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
            paths.routesDir,
            conventionRoutes.exclude
          );
          if (isBuildPhase) {
            warnings.forEach(warning => {
              console.warn(warning);
            });
          }
          routes = _routes;
        }

        const extraRoutes = (await pluginRunner.addMiddlewareRoutes()).flat();
        return generateMiddlewareRoutesContent(extraRoutes.concat(routes), {
          baseDir: paths.routesDir
        });
      },
      dependencies: [paths.routesDir]
    });

    const loadersFile = defineFile({
      name: 'loaders.js',
      content: async () => {
        const routes = getRoutes();
        const loaders: Record<string, string> = {};
        const traverseRoutes = (routes: IPageRouteConfigWithId[]) => {
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

export default {
  core: plugin
};
