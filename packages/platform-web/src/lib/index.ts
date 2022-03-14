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
  IPluginContext
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { initServerPlugins, getManager } from '@shuvi/service';
import { setRuntimeConfig } from '@shuvi/platform-shared/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import { IWebpackEntry } from '@shuvi/service/lib/bundler/config';
import { modelPlugin } from '@shuvi/plugins';
import {
  sharedPlugin,
  getInternalRuntimeFilesCreator,
  getRuntimeConfigFromConfig
} from '@shuvi/platform-shared/lib/platform';
import generateResource from './generateResource';
import { resolveAppFile } from './paths';
import { appRoutes } from './hooks';
import FeatureOnDemanCompilePage from './features/on-demand-compile-page';
import FeatureAPIMiddleware from './features/api-middleware';
import FeaturePageMiddleware from './features/page-middleware';
import FeatureHTMLRender from './features/html-render';

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
    addRuntimeService: () => [
      {
        source: '@shuvi/platform-web/lib/types/runtime-service',
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
      // keep the order, it will affect the behaviors
      FeatureOnDemanCompilePage,
      FeatureAPIMiddleware,
      FeaturePageMiddleware,
      FeatureHTMLRender,
      ...platformFrameworkContent.plugins
    ],
    getInternalRuntimeFiles
  };
};

export default platform;
