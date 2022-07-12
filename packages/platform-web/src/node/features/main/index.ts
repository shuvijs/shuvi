import {
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  createPlugin
} from '@shuvi/service';
import { IPlatformContext, ResolvedPlugin } from '@shuvi/service/lib/core';

import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import {
  setRuntimeConfig,
  setPublicRuntimeConfig
} from '@shuvi/platform-shared/shared';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import { getRuntimeConfigFromConfig } from '@shuvi/platform-shared/node';
import generateResource from './generateResource';
import { resolveAppFile } from '../../paths';
import { appRoutes } from './hooks';
import { buildHtml } from './buildHtml';
import { getMiddlewares } from '../middlewares';

function getServerEntry(): IWebpackEntry {
  return {
    [BUILD_SERVER_FILE_SERVER]: [resolveAppFile('entry', 'server')]
  };
}

/** This main plugin uses `platformContext` so that it is set to a plugin getter */
export const getPlugin = (
  platformContext: IPlatformContext
): ResolvedPlugin => {
  const core = createPlugin({
    setup: ({ addHooks }) => {
      addHooks({ appRoutes });
    },
    afterInit: async context => {
      const { public: publicRuntimeConfig, server: serverRuntimeConfig } =
        await getRuntimeConfigFromConfig(context);

      const serverKeys = Object.keys(serverRuntimeConfig);
      const publicKeys = Object.keys(publicRuntimeConfig);
      for (let index = 0; index < serverKeys.length; index++) {
        const key = serverKeys[index];
        const hasSameKey = publicKeys.includes(key);
        if (hasSameKey) {
          console.warn(
            `Warning: key "${key}" exist in both "runtimeConfig" and "publicRuntimeConfig". Please rename the key, or the value from "publicRuntimeConfig" will be applied.\n`
          );
          break;
        }
      }

      if (serverKeys) {
        setRuntimeConfig(serverRuntimeConfig);
      }
      if (publicKeys) {
        setPublicRuntimeConfig(publicRuntimeConfig);
      }
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
    configWebpack: chain => {
      chain.merge({
        entry: {
          [BUILD_CLIENT_RUNTIME_POLYFILL]: ['@shuvi/app/core/polyfill'],
          [BUILD_CLIENT_RUNTIME_MAIN]: [resolveAppFile('entry', 'client')]
        }
      });
      return chain;
    },
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
    types: '@shuvi/platform-web/esm/node/features/main/shuvi-app'
  };
};
