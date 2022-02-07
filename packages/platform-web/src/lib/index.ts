import fse from 'fs-extra';
import path from 'path';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  IRequest,
  IPlatform,
  createPlugin,
  IPluginContext,
  IUserRouteConfig
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { initServerPlugins, getManager } from '@shuvi/service';
import { setRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import { getUserCustomFileCandidates } from '@shuvi/service/lib/project';
import { getRoutesFromFiles } from '@shuvi/service/lib/route';
import statePlugin from '@shuvi/plugins/lib/model';
import generateResource from './generateResource';
import {
  getApiRoutesContent,
  getApiRoutesContentFromRawRoutes
} from './apiRoute';
import {
  getNormalizedRoutes,
  getRoutesContent,
  getRoutesFromRawRoutes,
  setRoutes
} from './pageRoute';
import { getMiddlewareRoutesContentFromRawRoutes } from './middlewareRoute';
import { resolveAppFile } from './paths';
import { appRoutes } from './hooks';

function getServerEntry(context: IPluginContext): IWebpackEntry {
  const { ssr } = context.config;
  return {
    [BUILD_SERVER_FILE_SERVER]: [
      resolveAppFile('entry', 'server', ssr ? 'ssr' : 'spa')
    ]
  };
}

async function buildHtml({
  context,
  pathname,
  filename
}: {
  context: IPluginContext;
  pathname: string;
  filename: string;
}) {
  const serverPlugins = context.serverPlugins;
  const pluginManger = getManager();
  const serverPluginContext = initServerPlugins(
    pluginManger,
    serverPlugins,
    context
  );
  const renderToHTML = require('./ssr').renderToHTML;
  const { html } = await renderToHTML({
    req: {
      url: pathname,
      headers: {}
    } as IRequest,
    serverPluginContext
  });

  if (html) {
    await fse.writeFile(
      path.resolve(context.paths.buildDir, BUILD_DEFAULT_DIR, filename),
      html
    );
  }
}

const platform: IPlatform = async ({ framework = 'react' } = {}) => {
  const mainPlugin = createPlugin({
    setup: ({ addHooks }) => {
      addHooks({ appRoutes });
    },
    appRuntimeFile: async ({ createFile, fileSnippets }, context) => {
      const {
        config: {
          apiRoutes,
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
            content: ({ getAllFiles }) => {
              const rawRoutes = getRoutesFromFiles(
                getAllFiles(),
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
            dependencies: [paths.pagesDir]
          });

      const middlewareRoutesFile = hasConfigRoutes
        ? createFile({
            name: 'middlewareRoutes.js',
            content: () => {
              return getMiddlewareRoutesContentFromRawRoutes(
                routes,
                paths.pagesDir
              );
            }
          })
        : createFile({
            name: 'middlewareRoutes.js',
            content: ({ getAllFiles }) => {
              const rawRoutes = getRoutesFromFiles(
                getAllFiles(),
                paths.pagesDir
              );
              return getMiddlewareRoutesContentFromRawRoutes(
                rawRoutes,
                paths.pagesDir
              );
            },
            dependencies: [paths.pagesDir]
          });

      const { prefix } = context.config.apiConfig || {};
      const apiRoutesFile =
        Array.isArray(apiRoutes) && apiRoutes.length
          ? createFile({
              name: 'apiRoutes.js',
              content: () =>
                getApiRoutesContent(apiRoutes, paths.apisDir, prefix)
            })
          : createFile({
              name: 'apiRoutes.js',
              content: ({ getAllFiles }) => {
                const rawRoutes = getRoutesFromFiles(
                  getAllFiles(),
                  paths.apisDir,
                  true
                );
                return getApiRoutesContentFromRawRoutes(
                  rawRoutes,
                  paths.apisDir,
                  prefix
                );
              },
              dependencies: [paths.apisDir]
            });

      const userDocumentFileModuleExportProxy =
        fileSnippets.moduleExportProxyCreater();
      const userDocumentFile = {
        name: 'user/document.js',
        content: () =>
          userDocumentFileModuleExportProxy.getContent(
            getUserCustomFileCandidates(paths.rootDir, 'document', 'noop')
          ),
        mounted: userDocumentFileModuleExportProxy.mounted,
        unmounted: userDocumentFileModuleExportProxy.unmounted
      };

      const userServerFileModuleExportProxy =
        fileSnippets.moduleExportProxyCreater();
      const userServerFile = {
        name: 'user/server.js',
        content: () =>
          userServerFileModuleExportProxy.getContent(
            getUserCustomFileCandidates(paths.rootDir, 'server', 'noop')
          ),
        mounted: userServerFileModuleExportProxy.mounted,
        unmounted: userServerFileModuleExportProxy.unmounted
      };

      return [
        routerConfigFile,
        routesFile,
        middlewareRoutesFile,
        apiRoutesFile,
        userServerFile,
        userDocumentFile
      ];
    },
    afterInit: context => {
      if (typeof context.config.runtimeConfig === 'object') {
        setRuntimeConfig(context.config.runtimeConfig);
      }
    },
    appEntryCode: () => {
      return `import "${resolveAppFile('entry', 'client')}"`;
    },
    runtimeService: () => ({
      source: '@shuvi/platform-web/lib/types',
      exported: '* as RuntimeServer'
    }),
    extraTarget: ({ createConfig }, context) => {
      const serverWebpackHelpers = webpackHelpers();
      const serverChain = createConfig({
        name: BUNDLER_TARGET_SERVER,
        node: true,
        entry: getServerEntry(context),
        outputDir: BUILD_SERVER_DIR,
        webpackHelpers: serverWebpackHelpers
      });
      return {
        name: BUNDLER_TARGET_SERVER,
        chain: serverChain
      };
    },
    serverPlugin: () => [
      require.resolve('./serverPlugin/serverMiddleware'),
      require.resolve('./serverPlugin/customFiles')
    ],
    addResource: context => generateResource(context),
    afterBuild: async context => {
      if (
        context.config.platform.target === 'spa' &&
        context.mode === 'production'
      ) {
        await buildHtml({
          context,
          pathname: '/',
          filename: 'index.html'
        });
      }
    }
  });
  const frameworkPlugins: IPlatform = require(`./targets/${framework}`).default;
  return [mainPlugin, statePlugin, ...(await frameworkPlugins())];
};

export default platform;
