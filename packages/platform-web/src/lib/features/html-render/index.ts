import { createPlugin, IUserRouteConfig, IRouteConfig } from '@shuvi/service';
import {
  getRoutesFromFiles,
  getRoutesWithLayoutFromDir,
  renameFilepathToComponent,
  isDirectory,
  ConventionRouteRecord,
  PageRouteRecord,
  LayoutRouteRecord
} from '@shuvi/platform-shared/lib/node';
import {
  getUserCustomFileCandidates,
  getFirstModuleExport,
  getAllFiles
} from '@shuvi/service/lib/project/file-utils';
import { buildToString } from '@shuvi/toolpack/lib/utils/build-loaders';
import * as fs from 'fs';
import * as path from 'path';
import { extendedHooks } from './hooks';
import {
  getNormalizedRoutes,
  getRoutesContent,
  setRoutes,
  getRoutes
} from './lib';
import server from './server-plugin-custom-server';
import { ifComponentHasLoader } from './lib';
import { FileOptions } from '@shuvi/service/lib/project';
import { IRouteRecord } from '@shuvi/router-react';

export { IRenderToHTML } from './hooks';
export { getSSRMiddleware, IDocumentProps, ITemplateData } from './lib';

const transformConventionRouteRecordToIRouteRecord = (
  routeRecords: ConventionRouteRecord[]
): IRouteRecord[] => {
  const pageRoutes = routeRecords.filter(record => 'pagePath' in record) as (
    | LayoutRouteRecord
    | PageRouteRecord
  )[];
  return pageRoutes.map(record => {
    const iRouteRecord: IRouteRecord = {
      path: record.path,
      filepath: record.pagePath
    };

    if ('children' in record && Array.isArray(record.children)) {
      iRouteRecord.children = transformConventionRouteRecordToIRouteRecord(
        record.children
      );
    }

    return iRouteRecord;
  });
};

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
    let routesFile: FileOptions;
    if (hasConfigRoutes) {
      const modifiedRoutes = getRoutesAfterPlugin(routes);
      const normalizedRoutes = getNormalizedRoutes(
        modifiedRoutes,
        paths.pagesDir
      );
      setRoutes(normalizedRoutes);
      routesFile = createFile({
        name: 'routes.js',
        content: () => {
          return getRoutesContent(normalizedRoutes, paths.pagesDir);
        }
      });
    } else {
      routesFile = createFile({
        name: 'routes.js',
        content: async () => {
          // read src routes
          let rawRoutes: IRouteRecord[] = [];

          let hasRoutesDir: boolean = false;

          try {
            hasRoutesDir = await isDirectory(paths.routesDir);
          } catch (e) {}

          if (hasRoutesDir) {
            const { routes, warnings } = await getRoutesWithLayoutFromDir(
              paths.routesDir
            );
            if (Array.isArray(warnings) && warnings.length) {
              warnings.forEach(warning => {
                console.warn(warning);
              });
            }
            rawRoutes = transformConventionRouteRecordToIRouteRecord(routes);
          } else {
            rawRoutes = getRoutesFromFiles(
              getAllFiles(paths.pagesDir),
              paths.pagesDir
            );
          }

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
        const content = `${imports}  export default {\n  ${exports}\n}`;
        return content;
      },
      dependencies: [
        paths.pagesDir,
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
      dependencies: [paths.pagesDir, loadersFileName]
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
