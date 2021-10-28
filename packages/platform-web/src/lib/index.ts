import { IApi } from '@shuvi/service';
import { IRuntime } from '@shuvi/platform-core';

import { resolveAppFile } from './paths';

const platform: IRuntime = {
  async install(api: IApi): Promise<void> {
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

export default platform;
