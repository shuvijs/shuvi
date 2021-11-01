import { IRuntime } from '@shuvi/service';

import { resolveAppFile } from './paths';
import { setRuntimeConfig } from '@shuvi/service/lib/lib/runtimeConfig';
import { initCoreResource } from './initCoreResource';

const platformWeb: IRuntime = {
  async install(api): Promise<void> {
    initCoreResource(api);

    if (typeof api.config.runtimeConfig === 'object') {
      setRuntimeConfig(api.config.runtimeConfig);
    }

    // set application and entry
    const {
      ssr,
      router: { history }
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

    // install framework
    const { framework = 'react' } = api.config.platform || {};
    const frameworkInstance: IRuntime =
      require(`@shuvi/platform-web-${framework}`).default;
    frameworkInstance.install(api);
  }
};

export default platformWeb;
