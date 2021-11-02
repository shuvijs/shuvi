import fse from 'fs-extra';
import path from 'path';
import { Api, BUILD_CLIENT_DIR, IRequest, IRuntime } from '@shuvi/service';
import { setRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
import { initCoreResource } from './initCoreResource';
import { resolveAppFile } from './paths';
import { getApiRoutesMiddleware } from './apiRoute';
import { getSSRMiddleware, renderToHTML } from './SSR';

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
      path.resolve(api.paths.buildDir, BUILD_CLIENT_DIR, filename),
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

    // set application and entry
    const {
      ssr,
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

    api.setServerModule({
      application: resolveAppFile(
        'application',
        'server',
        ssr ? 'create-application' : 'create-application-spa'
      ),
      entry: resolveAppFile('entry', 'server')
    });

    api.setClientModule({
      application: resolveAppFile('application', 'client', ApplicationModule),
      entry: resolveAppFile('entry', 'client')
    });

    if (target === 'spa' && api.mode === 'production') {
      await buildHtml({ api, pathname: '/', filename: 'index.html' });
    }

    api.addServerMiddlewareLast(getApiRoutesMiddleware(api));
    api.addServerMiddlewareLast(getSSRMiddleware(api));

    // install framework
    const { framework = 'react' } = api.config.platform || {};
    const frameworkInstance: IRuntime =
      require(`@shuvi/platform-web-${framework}`).default;
    frameworkInstance.install(api);
  }
};

export default platformWeb;
