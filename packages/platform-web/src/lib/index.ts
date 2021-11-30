import fse from 'fs-extra';
import path from 'path';
import {
  Api,
  BUILD_DEFAULT_DIR,
  BUILD_SERVER_DIR,
  BUILD_SERVER_FILE_SERVER,
  IRequest,
  IRuntime
} from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '@shuvi/shared/lib/constants';
import { setRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
import { webpackHelpers } from '@shuvi/toolpack/lib/webpack/config';
import {
  createWebpackConfig,
  IWebpackEntry
} from '@shuvi/service/lib/bundler/config';

import { initCoreResource } from './initCoreResource';
import { resolveAppFile } from './paths';
import { getApiRoutesMiddleware } from './apiRoute';
import { getMiddlewareRoutesMiddleware } from './middlewareRoute';
import { getSSRMiddleware, renderToHTML } from './SSR';

function getServerEntry(_api: Api): IWebpackEntry {
  const { ssr } = _api.config;
  return {
    [BUILD_SERVER_FILE_SERVER]: [
      resolveAppFile('entry', 'server', ssr ? 'ssr' : 'spa')
    ]
  };
}

async function buildHtml({
  api,
  pathname,
  filename
}: {
  api: Api;
  pathname: string;
  filename: string;
}) {
  const { html } = await renderToHTML({
    req: {
      url: pathname,
      headers: {}
    } as IRequest,
    api
  });

  if (html) {
    await fse.writeFile(
      path.resolve(api.paths.buildDir, BUILD_DEFAULT_DIR, filename),
      html
    );
  }
}

const platformWeb: IRuntime = {
  async install(api): Promise<void> {
    initCoreResource(api);

    if (typeof api.config.runtimeConfig === 'object') {
      setRuntimeConfig(api.config.runtimeConfig);
    }

    const serverWebpackHelpers = webpackHelpers();
    const serverChain = createWebpackConfig(api, {
      name: BUNDLER_TARGET_SERVER,
      node: true,
      entry: getServerEntry(api),
      outputDir: BUILD_SERVER_DIR,
      webpackHelpers: serverWebpackHelpers
    });

    api.addBuildTargets({
      chain: serverChain,
      name: BUNDLER_TARGET_SERVER,
      mode: api.mode,
      helpers: serverWebpackHelpers
    });

    // set application and entry
    const {
      router: { history },
      target
    } = api.config;
    let ApplicationModule;
    if (history === 'browser') {
      ApplicationModule = 'create-application-history-browser';
    } else if (history === 'hash') {
      ApplicationModule = 'create-application-history-hash';
    } else {
      ApplicationModule = 'create-application-history-memory';
    }

    api.setClientModule({
      application: resolveAppFile('application', 'client', ApplicationModule),
      entry: resolveAppFile('entry', 'client')
    });

    if (target === 'spa' && api.mode === 'production') {
      await buildHtml({ api, pathname: '/', filename: 'index.html' });
    }

    api.addServerMiddlewareLast(getApiRoutesMiddleware(api));
    api.addServerMiddlewareLast(getMiddlewareRoutesMiddleware(api));
    api.addServerMiddlewareLast(getSSRMiddleware(api));

    // install framework
    const { framework = 'react' } = api.config.platform || {};
    const frameworkInstance: IRuntime =
      require(`./targets/${framework}`).default;
    frameworkInstance.install(api);
  }
};

export default platformWeb;
