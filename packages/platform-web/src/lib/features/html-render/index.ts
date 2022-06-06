import { createPlugin, IUserRouteConfig, IRouteConfig } from '@shuvi/service';
import {
  getRoutesFromFiles,
  renameFilepathToComponent
} from '@shuvi/service/lib/route';
import {
  getUserCustomFileCandidates,
  getFirstModuleExport,
  getAllFiles
} from '@shuvi/service/lib/project/file-utils';
import { build } from '@shuvi/toolpack/lib/utils/build-loaders';
import path from 'path';
import { extendedHooks } from './hooks';
import {
  getNormalizedRoutes,
  getRoutesContent,
  setRoutes,
  getRoutes
} from './lib';
import server from './server-plugin-custom-server';
import { ifComponentHasLoader } from './lib';
export { IRenderToHTML } from './hooks';
export { getSSRMiddleware, IDocumentProps, ITemplateData } from './lib';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeFile: ({ createFile }, context) => {
    const {
      config: {
        routes,
        router: { history }
      },
      paths,
      pluginRunner
    } = context;
    const routerConfigFile = createFile({
      name: 'routerConfig.js',
      content: () => {
        return `export const historyMode = "${history}";`;
      }
    });
    const getRoutesAfterPlugin = (routes: IUserRouteConfig[]) =>
      pluginRunner.appRoutes(routes);
    // if config.routes is defined, use config
    const hasConfigRoutes = Array.isArray(routes);
    const routesFile = hasConfigRoutes
      ? createFile({
          name: 'routes.js',
          content: () => {
            const modifiedRoutes = getRoutesAfterPlugin(routes);
            const normalizedRoutes = getNormalizedRoutes(
              modifiedRoutes,
              paths.pagesDir
            );
            setRoutes(normalizedRoutes);
            return getRoutesContent(normalizedRoutes, paths.pagesDir);
          }
        })
      : createFile({
          name: 'routes.js',
          content: () => {
            const rawRoutes = getRoutesFromFiles(
              getAllFiles(paths.pagesDir),
              paths.pagesDir
            );
            const renamedRoutes = renameFilepathToComponent(rawRoutes);
            const modifiedRoutes = getRoutesAfterPlugin(renamedRoutes);
            const normalizedRoutes = getNormalizedRoutes(
              modifiedRoutes,
              paths.pagesDir
            );
            setRoutes(normalizedRoutes);
            return getRoutesContent(normalizedRoutes, paths.pagesDir);
          },
          dependencies: paths.pagesDir
        });

    const loadersFiles = createFile({
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
        const content = `${imports}  export default {\n  ${exports}\n}`;
        return content;
      }
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
    return [
      routerConfigFile,
      routesFile,
      userServerFile,
      userDocumentFile,
      loadersFiles
    ];
  },
  afterShuviAppBuild: async context => {
    await build(path.join(context.paths.appDir, 'files'), context.mode);
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
