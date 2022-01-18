import fse from 'fs-extra';
import path from 'path';
import {
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  IRequest,
  IPlatform,
  createCliPlugin,
  IPluginContext
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { initServerContext, getManager } from '@shuvi/service';
import { setRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import statePlugin from '@shuvi/plugins/lib/model';
import generateResource from './generateResource';
import { resolveAppFile } from './paths';
import removeRequireCache from './removeRequireCache'

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
  const pluginManger = getManager();
  const serverPluginContext = initServerContext(
    pluginManger,
    context
  );
  const renderToHTML = require('./SSR').renderToHTML
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
  const mainPlugin = createCliPlugin({
    setup: context => {
      if (typeof context.config.runtimeConfig === 'object') {
        setRuntimeConfig(context.config.runtimeConfig);
      }
    },
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
    serverPlugin: () => require.resolve('./serverPlugin'),
    bundlerDone: (_, context) => {
      generateResource(context);
      removeRequireCache('@shuvi/service/resources')
    },
    afterBuild: async context => {
      generateResource(context);
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
