import {
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  createPlugin
} from '@shuvi/service';
import { IPlatformContext, ResolvedPlugin } from '@shuvi/service/lib/core';

import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import generateResource from './generateResource';
import { resolvePkgFile } from '../../paths';
import { buildHtml } from './buildHtml';
import { getMiddlewares } from '../middlewares';

function getServerEntry(): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: [resolvePkgFile('esm/shuvi-app/entry/server')]
  };
}

/** This main plugin uses `platformContext` so that it is set to a plugin getter */
export const getPlugin = (
  platformContext: IPlatformContext
): ResolvedPlugin => {
  const core = createPlugin({
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
    configWebpack: chain => {
      chain.merge({
        entry: {
          [BUILD_CLIENT_RUNTIME_POLYFILL]: ['@shuvi/app/core/polyfill'],
          [BUILD_CLIENT_RUNTIME_MAIN]: [
            resolvePkgFile('esm/shuvi-app/entry/client')
          ]
        }
      });
      return chain;
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
    core
  };
};
