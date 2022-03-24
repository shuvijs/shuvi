import { createPlugin, IUserRouteConfig } from '@shuvi/service';
import { getRoutesFromFiles } from '@shuvi/service/lib/route';
import {
  getUserCustomFileCandidates,
  getFisrtModuleExport
} from '@shuvi/service/lib/project/file-utils';
import { extendedHooks } from './hooks';
import {
  getNormalizedRoutes,
  getRoutesContent,
  getRoutesFromRawRoutes,
  setRoutes
} from './lib';
import server from './server-plugin-custom-server';
export { IRenderToHTML } from './hooks';
export { getSSRMiddleware, IDocumentProps, ITemplateData } from './lib';

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeFile: ({ createFile, getAllFiles }, context) => {
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
    const getFinalRoutes = (routes: IUserRouteConfig[]) =>
      pluginRunner.appRoutes(routes);
    // if config.routes is defined, use config
    const hasConfigRoutes = Array.isArray(routes);
    const routesFile = hasConfigRoutes
      ? createFile({
          name: 'routes.js',
          content: () => {
            const normalizedRoutes = getNormalizedRoutes(
              routes,
              paths.pagesDir
            );
            const finalRoutes = getFinalRoutes(normalizedRoutes);
            setRoutes(finalRoutes);
            return getRoutesContent(finalRoutes, paths.pagesDir);
          }
        })
      : createFile({
          name: 'routes.js',
          content: () => {
            const rawRoutes = getRoutesFromFiles(
              getAllFiles(paths.pagesDir),
              paths.pagesDir
            );
            const normalizedRoutes = getRoutesFromRawRoutes(
              rawRoutes,
              paths.pagesDir
            );
            const finalRoutes = getFinalRoutes(normalizedRoutes);
            setRoutes(finalRoutes);
            return getRoutesContent(finalRoutes, paths.pagesDir);
          },
          dependencies: paths.pagesDir
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
        return getFisrtModuleExport(
          getAllFiles(documentCandidates),
          documentCandidates
        );
      },
      dependencies: documentCandidates
    });
    const userServerFile = createFile({
      name: 'user/server.js',
      content: () => {
        return getFisrtModuleExport(
          getAllFiles(serverCandidates),
          serverCandidates
        );
      },
      dependencies: serverCandidates
    });
    return [routerConfigFile, routesFile, userServerFile, userDocumentFile];
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
  server
};
