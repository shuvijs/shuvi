import { createPlugin } from '@shuvi/service';
import {
  getRawRoutesFromDir,
  getPageRoutes,
  getApiRoutes,
  // getMiddlewareRoutes,
  IPageRouteConfig
} from '@shuvi/platform-shared/node';
import {
  IPageRouteConfigWithId,
  IMiddlewareRouteConfig
} from '@shuvi/platform-shared/shared';
import { LOADER_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';
import logger from '@shuvi/utils/lib/logger';
import { addRoutes, addApiRoutes, addMiddlewareRoutes } from './hooks';
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

let isWarnedAddMiddlewareRoutes: boolean = false;

const plugin = createPlugin({
  setup: ({ addHooks }) => {
    addHooks({ addRoutes, addApiRoutes, addMiddlewareRoutes });
  },
  addRuntimeFile: async ({ defineFile, getContent }, context) => {
    const {
      config: { routes: pageRoutes, conventionRoutes },
      paths,
      pluginRunner,
      phase,
      mode
    } = context;
    const isBuildPhase = phase === 'PHASE_PRODUCTION_BUILD';

    const rawRoutes = defineFile({
      name: 'virtual-raw-routes.js',
      virtual: true,
      content: async () => {
        const rawRoutes = await getRawRoutesFromDir(
          paths.routesDir,
          conventionRoutes.exclude
        );
        return rawRoutes;
      },
      dependencies: [paths.routesDir]
    });

    const pageRoutesFile = defineFile({
      name: 'routes.js',
      content: async () => {
        let routes: IPageRouteConfig[];
        const hasConfigRoutes = Array.isArray(pageRoutes);
        if (hasConfigRoutes) {
          routes = pageRoutes as IPageRouteConfig[];
        } else {
          const { routes: _routes, warnings } = await getPageRoutes(
            getContent(rawRoutes),
            conventionRoutes.exclude
          );

          if (isBuildPhase) {
            warnings.forEach(warning => {
              logger.warn(warning.msg);
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
        return generatePageRoutesContent(
          normalizedRoutes,
          mode === 'development'
        );
      },
      dependencies: [rawRoutes]
    });

    const apiRoutesFile = defineFile({
      name: 'apiRoutes.js',
      content: async () => {
        const { routes: fsRoutes, warnings } = await getApiRoutes(
          getContent(rawRoutes),
          conventionRoutes.exclude
        );

        if (isBuildPhase) {
          warnings.forEach(warning => {
            logger.warn(warning);
          });
        }

        const pluginRoutes = (await pluginRunner.addApiRoutes()).flat();
        return generateApiRoutesContent(
          pluginRoutes.concat(fsRoutes),
          paths.routesDir
        );
      },
      dependencies: [rawRoutes]
    });
    const middlewareRoutesFile = defineFile({
      name: 'middlewareRoutes.js',
      content: async () => {
        // Remove the 'middleware' file convention first, and deal with it in a future major update.
        // const { routes: _routes, warnings } = await getMiddlewareRoutes(
        //   getContent(rawRoutes),
        //   conventionRoutes.exclude
        // );
        // if (isBuildPhase) {
        //   warnings.forEach(warning => {
        //     logger.warn(warning);
        //   });
        // }
        // let fsRoutes = _routes;

        const pluginRoutes: IMiddlewareRouteConfig[] = (
          await pluginRunner.addMiddlewareRoutes()
        ).flat();

        if (!isWarnedAddMiddlewareRoutes && pluginRoutes.length > 0) {
          logger.warn(
            'Warning: addMiddlewareRoutes is an experimental feature, we recommend using api routes instead.'
          );
          isWarnedAddMiddlewareRoutes = true;
        }

        return generateMiddlewareRoutesContent(pluginRoutes, {
          baseDir: paths.routesDir
        });
      },
      dependencies: [rawRoutes]
    });

    const pageLoadersFile = defineFile({
      name: 'page-loaders.js',
      content: async () => {
        const routes = getRoutes();
        const loaders: Record<string, string> = {};
        const traverseRoutes = (routes: IPageRouteConfigWithId[]) => {
          routes.forEach(r => {
            const { component, id, children } = r;
            if (component && id) {
              loaders[id] = component;
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
          imports += `import { loader as loader_${index} } from '${component}?${LOADER_RESOURCE_QUERYSTRING}'\n`;
          exports += `'${id}': loader_${index},\n`;
        });
        return `${imports}  export default {\n  ${exports}\n}`;
      },
      dependencies: [pageRoutesFile]
    });

    return [
      rawRoutes,
      pageRoutesFile,
      apiRoutesFile,
      middlewareRoutesFile,
      pageLoadersFile
    ];
  }
});

export default {
  core: plugin
};
