import {
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  createPlugin
} from '@shuvi/service';
import { IPlatformContext, ResolvedPlugin } from '@shuvi/service/lib/core';
import {
  BUNDLER_DEFAULT_TARGET,
  BUNDLER_TARGET_SERVER
} from '@shuvi/shared/lib/constants';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import { resolvePkgFile } from '../../paths';
import { getMiddlewares } from '../middlewares';
import generateResource from './lib/generateResource';
import { buildHtml } from './lib/buildHtml';
import server from './server';

function getServerEntry(): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: [resolvePkgFile('esm/shuvi-app/entry/server')]
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
    configWebpack: (chain, { name }) => {
      if (name === BUNDLER_DEFAULT_TARGET) {
        chain.merge({
          entry: {
            [BUILD_CLIENT_RUNTIME_POLYFILL]: ['@shuvi/app/core/polyfill'],
            [BUILD_CLIENT_RUNTIME_MAIN]: [
              resolvePkgFile('esm/shuvi-app/entry/client')
            ]
          }
        });
      }
      return chain;
    },
    addExtraTarget: ({ createConfig }, context) => {
      const serverWebpackHelpers = webpackHelpers();
      const serverChain = createConfig({
        name: BUNDLER_TARGET_SERVER,
        node: true,
        entry: getServerEntry(),
        outputDir: BUILD_SERVER_DIR,
        webpackHelpers: serverWebpackHelpers
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
        source: resolvePkgFile('esm/shuvi-app/shuvi-runtime-index'),
        exported: '*'
      },
      {
        source: resolvePkgFile('esm/shuvi-app/shuvi-runtime-server'),
        filepath: 'server.ts',
        exported: '*'
      }
    ],
    addResource: context => generateResource(context),
    afterBuild: async context => {
      await buildHtml({
        context,
        serverPlugins: platformContext.serverPlugins,
        getMiddlewares,
        pathname: '/',
        filename: 'index.html'
      });
    }
  });

  return {
    core,
    server,
    types: resolvePkgFile('lib/node/features/html-render/shuvi-app.d.ts')
  };
};
