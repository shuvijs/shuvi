import fse from 'fs-extra';
import path from 'path';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  IRequest,
  IPlatform,
  createPlugin,
  IPluginContext,
  IUserRouteConfig
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { initServerPlugins, getManager } from '@shuvi/service';
import { setRuntimeConfig } from '@shuvi/platform-shared/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import {
  getUserCustomFileCandidates,
  getFisrtModuleExport
} from '@shuvi/service/lib/project/file-utils';
import { getRoutesFromFiles } from '@shuvi/service/lib/route';
import { modelPlugin } from '@shuvi/plugins';
import {
  sharedPlugin,
  getInternalRuntimeFilesCreator,
  getRuntimeConfigFromConfig
} from '@shuvi/platform-shared/lib/platform';
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
import FeatureOnDemanCompilePage from './features/on-demand-compile-page';
import FeatureServerSideRender from './features/server-side-render';

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
  const platformFramework = require(`./targets/${framework}`).default;
  const platformFrameworkContent = await platformFramework();
  const mainPlugin = createPlugin({
    setup: ({ addHooks }) => {
      addHooks({ appRoutes });
    },
    afterInit: async context => {
      const runtimeConfig = await getRuntimeConfigFromConfig(context);
      if (Object.keys(runtimeConfig)) {
        setRuntimeConfig(runtimeConfig);
      }
    },
    addRuntimeFile: async ({ createFile, getAllFiles }, context) => {
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
            content: () => {
              const rawRoutes = getRoutesFromFiles(
                getAllFiles(paths.pagesDir),
                paths.pagesDir
              );
              return getMiddlewareRoutesContentFromRawRoutes(
                rawRoutes,
                paths.pagesDir
              );
            },
            dependencies: paths.pagesDir
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
              content: () => {
                const rawRoutes = getRoutesFromFiles(
                  getAllFiles(paths.apisDir),
                  paths.apisDir,
                  true
                );
                return getApiRoutesContentFromRawRoutes(
                  rawRoutes,
                  paths.apisDir,
                  prefix
                );
              },
              dependencies: paths.apisDir
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

      return [
        routerConfigFile,
        routesFile,
        middlewareRoutesFile,
        apiRoutesFile,
        userServerFile,
        userDocumentFile
      ];
    },
    addRuntimeService: () => [
      {
        source: '@shuvi/platform-web/lib/types',
        exported: '* as RuntimeServer'
      },
      {
        source: require.resolve(
          '@shuvi/platform-shared/lib/runtime/helper/getPageData'
        ),
        exported: '{ getPageData }'
      }
    ],
    addExtraTarget: ({ createConfig }, context) => {
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
    configWebpack: chain => {
      chain.merge({
        entry: {
          [BUILD_CLIENT_RUNTIME_MAIN]: ['@shuvi/app/entry'],
          [BUILD_CLIENT_RUNTIME_POLYFILL]: ['@shuvi/app/core/polyfill']
        }
      });
      return chain;
    },
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

  const platformModule = platformFrameworkContent.platformModule as string;
  const entry = `import "${resolveAppFile('entry', 'client')}"`;
  const polyfills = platformFrameworkContent.polyfills as string[];

  const getInternalRuntimeFiles = getInternalRuntimeFilesCreator(
    platformModule,
    entry,
    polyfills
  );

  return {
    plugins: [
      mainPlugin,
      modelPlugin,
      sharedPlugin,
      FeatureOnDemanCompilePage,
      FeatureServerSideRender,
      ...platformFrameworkContent.plugins
    ],
    getInternalRuntimeFiles
  };
};

export default platform;
