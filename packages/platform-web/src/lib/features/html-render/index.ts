import { createPlugin, IRouteConfig, IUserRouteConfig } from '@shuvi/service';
import {
  getAllFiles,
  getFirstModuleExport,
  getUserCustomFileCandidates
} from '@shuvi/service/lib/project/file-utils';
import { buildToString } from '@shuvi/toolpack/lib/utils/build-loaders';
import * as fs from 'fs';
import * as path from 'path';
import { extendedHooks } from './hooks';
import {
  getNormalizedRoutes,
  getRoutes,
  getRoutesContent,
  ifComponentHasLoader,
  setRoutes
} from './lib';
import server from './server-plugin-custom-server';
import { FileOptions } from '@shuvi/service/lib/project';
import { isDirectory } from '@shuvi/utils/lib/file';
import { getPageAndLayoutRoutes } from '@shuvi/platform-shared/lib/node';
export { IRenderToHTML } from './hooks';
export {
  getSSRMiddleware,
  IDocumentProps,
  ITemplateData,
  IViewServer,
  IViewClient
} from './lib';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeFile: ({ createFile }, context) => {
    const {
      config: {
        routes,
        router: { history },
        experimental: { loader }
      },
      paths,
      pluginRunner
    } = context;
    const routerConfigFile = createFile({
      name: 'routerConfig.js',
      content: () => {
        return `export const historyMode = "${history}";
        export const loaderOptions = ${JSON.stringify(loader)}`;
      }
    });
    const getRoutesAfterPlugin = (routes: IUserRouteConfig[]) =>
      pluginRunner.appRoutes(routes);
    // if config.routes is defined, use config
    const hasConfigRoutes = Array.isArray(routes);
    let routesFile: FileOptions;
    if (hasConfigRoutes) {
      const modifiedRoutes = getRoutesAfterPlugin(routes);
      const normalizedRoutes = getNormalizedRoutes(
        modifiedRoutes,
        paths.routesDir
      );
      setRoutes(normalizedRoutes);
      routesFile = createFile({
        name: 'routes.js',
        content: () => {
          return getRoutesContent(normalizedRoutes, paths.routesDir);
        }
      });
    } else {
      routesFile = createFile({
        name: 'routes.js',
        content: async () => {
          // read src routes
          let rawRoutes: IUserRouteConfig[] = [];

          const hasRoutesDir: boolean = await isDirectory(paths.routesDir);

          if (hasRoutesDir) {
            const { routes, warnings } = await getPageAndLayoutRoutes(
              paths.routesDir
            );

            warnings.forEach(warning => {
              console.warn(warning.msg);
            });

            rawRoutes = routes;
          }

          const modifiedRoutes = getRoutesAfterPlugin(rawRoutes);
          const normalizedRoutes = getNormalizedRoutes(
            modifiedRoutes,
            paths.routesDir
          );
          setRoutes(normalizedRoutes);
          return getRoutesContent(normalizedRoutes, paths.routesDir);
        },
        dependencies: paths.routesDir
      });
    }
    const loadersFile = createFile({
      name: 'loaders.js',
      content: () => {
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
      dependencies: [
        paths.routesDir,
        path.join(paths.appDir, 'files', 'routes.js')
      ]
    });
    const documentCandidates = getUserCustomFileCandidates(
      paths.rootDir,
      'document',
      'noop'
    );
    const serverCandidates = getUserCustomFileCandidates(
      paths.rootDir,
      'server',
      'noop'
    );
    const userDocumentFile = createFile({
      name: 'user/document.js',
      content: () => {
        return getFirstModuleExport(
          getAllFiles(documentCandidates),
          documentCandidates
        );
      },
      dependencies: documentCandidates
    });
    const userServerFile = createFile({
      name: 'user/server.js',
      content: () => {
        return getFirstModuleExport(
          getAllFiles(serverCandidates),
          serverCandidates
        );
      },
      dependencies: serverCandidates
    });
    const loadersFileName = path.join(
      context.paths.appDir,
      'files',
      'loaders.js'
    );
    const pageLoadersFile = createFile({
      name: 'page-loaders.js',
      content: async () => {
        if (fs.existsSync(loadersFileName)) {
          return await buildToString(loadersFileName);
        }
        return '';
      },
      dependencies: [paths.routesDir, loadersFileName]
    });
    return [
      userDocumentFile,
      routerConfigFile,
      routesFile,
      userServerFile,
      loadersFile,
      pageLoadersFile
    ];
  },
  addRuntimeService: () => [
    {
      source: require.resolve(
        '@shuvi/platform-shared/lib/runtime/helper/getPageData'
      ),
      exported: '{ getPageData }'
    }
  ]
});

export default {
  core,
  server,
  types: path.join(__dirname, 'types')
};
