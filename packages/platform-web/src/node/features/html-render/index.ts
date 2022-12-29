import { ResolvedPlugin, createPlugin } from '@shuvi/service';
import { IPlatformContext } from '@shuvi/service/lib/core';
import { CopyFilePlugin } from '@shuvi/toolpack/lib/webpack/plugins/copy-file-plugin';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER,
  CLIENT_BUILD_MANIFEST_PATH,
  SERVER_BUILD_MANIFEST_PATH,
  SERVER_OUTPUT_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_POLYFILLS,
  BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL,
  BUILD_CLIENT_RUNTIME_WEBPACK,
  BUILD_CLIENT_RUNTIME_MAIN
} from '../../../shared';
import { resolvePkgFile } from '../../paths';
import { getVersion } from '../../version';
import { getMiddlewares } from '../middlewares';
import generateResource from './lib/generateResource';
import { buildHtml } from './lib/buildHtml';
import BuildManifestPlugin from './lib/webpack/build-manifest-plugin';
import server from './server';

const ENTRY_FLAG = 'shuviEntry';

function makeEntryRequest(req: string): string {
  return `${req}?${ENTRY_FLAG}=true`;
}

function getClientEntry(): IWebpackEntry {
  return {
    [BUILD_CLIENT_RUNTIME_MAIN]: [
      makeEntryRequest(resolvePkgFile('esm/shuvi-app/entry/client'))
    ]
  };
}

function getServerEntry(): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: [
      makeEntryRequest(resolvePkgFile('esm/shuvi-app/entry/server'))
    ]
  };
}

export {
  getPageMiddleware,
  IHtmlDocument,
  ITemplateData,
  IViewServer,
  IViewClient
} from './lib';

/** This plugin uses `platformContext` so that it is set to a plugin getter */
export const getPlugin = (
  platformContext: IPlatformContext
): ResolvedPlugin => {
  const core = createPlugin({
    configWebpack: (chain, { name, mode }, ctx) => {
      const isDev = mode === 'development';
      const pkgVersion = getVersion();
      const isServer = name === BUNDLER_TARGET_SERVER;
      const isClient = name === BUNDLER_TARGET_CLIENT;

      if (isClient) {
        chain.merge({
          entry: getClientEntry()
        });
        chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
        chain.plugin('polyfills').use(CopyFilePlugin, [
          {
            filePath: resolvePkgFile('polyfills/polyfills.js'),
            cacheKey: pkgVersion,
            name: BUILD_CLIENT_RUNTIME_POLYFILLS,
            info: {
              [BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL]: 1,
              // This file is already minified
              minimized: true
            }
          }
        ]);
        chain.plugin('private/build-manifest').use(BuildManifestPlugin, [
          {
            filename: CLIENT_BUILD_MANIFEST_PATH,
            modules: true,
            chunkRequest: isDev
          }
        ]);
      } else if (isServer) {
        if (!ctx.config.ssr) {
          chain.module
            .rule('spa-ignore')
            .test(/\.shuvi\/app\/user\/app\.js/)
            .use('empty-loader')
            .loader('@shuvi/empty-loader')
            .end()
            .pre();
        }

        chain.plugin('private/build-manifest').use(BuildManifestPlugin, [
          {
            filename: SERVER_BUILD_MANIFEST_PATH,
            modules: false,
            chunkRequest: isDev
          }
        ]);
      }

      return chain;
    },
    addExtraTarget: ({ createConfig }, context) => {
      const serverChain = createConfig({
        name: BUNDLER_TARGET_SERVER,
        node: true,
        entry: getServerEntry(),
        outputDir: SERVER_OUTPUT_DIR
      });
      return {
        name: BUNDLER_TARGET_SERVER,
        chain: serverChain
      };
    },
    addRuntimeFile: ({ defineFile }, context) => {
      const {
        config: {
          router: { history }
        }
      } = context;
      const routerConfigFile = defineFile({
        name: 'routerConfig.js',
        content: () => {
          return `export const historyMode = "${history}";`;
        }
      });

      return [routerConfigFile];
    },
    addRuntimeService: () => [
      {
        source: resolvePkgFile('lib/node/shuvi-runtime-server'),
        filepath: 'server.ts',
        exported: '*'
      }
    ],
    addResource: context => generateResource(context),
    afterBuild: async context => {
      if (context.config.ssr === false) {
        await buildHtml({
          context,
          serverPlugins: platformContext.serverPlugins,
          getMiddlewares,
          pathname: '/',
          filename: 'index.html'
        });
      }
    }
  });

  return {
    core,
    server,
    types: resolvePkgFile('lib/node/features/html-render/shuvi-app.d.ts')
  };
};
