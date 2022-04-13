import path from 'path';
import {
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  createPlugin,
  IPluginContext
} from '@shuvi/service';
import { IPlatformContext, ResolvedPlugin } from '@shuvi/service/lib/core';

import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { setRuntimeConfig } from '@shuvi/platform-shared/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';

import {
  getRuntimeConfigFromConfig
} from '@shuvi/platform-shared/lib/platform';
import generateResource from './generateResource';
import { resolveAppFile } from '../../paths';
import { appRoutes } from './hooks'
import { buildHtml } from './buildHtml'
import { getMiddlewares } from '../middlewares'

function getServerEntry(context: IPluginContext): IWebpackEntry {
  const { ssr } = context.config;
  return {
    [BUILD_SERVER_FILE_SERVER]: [
      resolveAppFile('entry', 'server', ssr ? 'ssr' : 'spa')
    ]
  };
}

/** This main plugin uses `platformContext` so that it is set to a plugin getter */
export const getPlugin = (platformContext: IPlatformContext): ResolvedPlugin => {
  const core = createPlugin({
    setup: ({ addHooks }) => {
      addHooks({ appRoutes });
    },
    afterInit: async context => {
      const runtimeConfig = await getRuntimeConfigFromConfig(context);
      if (Object.keys(runtimeConfig)) {
        setRuntimeConfig(runtimeConfig);
      }
    },
    addRuntimeService: () => [
      {
        source: path.resolve(__dirname, '../../types/runtime-service'),
        exported: '* as RuntimeServer'
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
    types: path.join(__dirname, 'types')
  }
}