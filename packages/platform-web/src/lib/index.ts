import fse from 'fs-extra';
import path from 'path';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  IRequest,
  IPlatform,
  createCliPlugin,
  ICliContext
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { initServerPlugins, getManager } from '@shuvi/service';
import { setRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';

import statePlugin from '@shuvi/plugins/lib/state/runtime';
import { getCoreResources } from './initCoreResource';
import { resolveAppFile } from './paths';
import { renderToHTML } from './SSR';

function getServerEntry(context: ICliContext): IWebpackEntry {
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
  context: ICliContext;
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

const platform: IPlatform = async context => {
  const mainPlugin = createCliPlugin({
    setup: context => {
      if (typeof context.config.runtimeConfig === 'object') {
        setRuntimeConfig(context.config.runtimeConfig);
      }
    },
    bundleResource: context => getCoreResources(context),
    clientModule: context => {
      const {
        router: { history }
      } = context.config;
      let ApplicationModule;
      if (history === 'browser') {
        ApplicationModule = 'create-application-history-browser';
      } else if (history === 'hash') {
        ApplicationModule = 'create-application-history-hash';
      } else {
        ApplicationModule = 'create-application-history-memory';
      }
      return {
        application: resolveAppFile('application', 'client', ApplicationModule),
        entry: resolveAppFile('entry', 'client')
      };
    },
    appExport: () => ({
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
    serverPlugin: () => require.resolve('./serverPlugin'),
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
  const { framework = 'react' } = context.config.platform || {};
  const frameworkPlugins: IPlatform = require(`./targets/${framework}`).default;
  return [mainPlugin, statePlugin, ...(await frameworkPlugins(context))];
};

export default platform;
