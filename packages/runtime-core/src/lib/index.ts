import { IApi } from '@shuvi/types';
import path from 'path';

const PACKAGE_DIR = path.dirname(
  require.resolve('@shuvi/runtime-core/package.json')
);

const resolveAppFile = (...paths: string[]) =>
  `${path.join(PACKAGE_DIR, 'shuvi-app', ...paths)}`;

class CoreRuntime {
  async install(api: IApi): Promise<void> {
    const {
      ssr,
      router: { history }
    } = api.config;
    let historyModule;
    if (history === 'browser') {
      historyModule = 'create-browser';
    } else if (history === 'hash') {
      historyModule = 'create-hash';
    } else {
      historyModule = 'create-memory';
    }
    api.setRuntimeCoreModule({
      client: {
        application: resolveAppFile('application', 'create-application-client'),
        history: resolveAppFile('application', 'history', historyModule),
        entry: resolveAppFile('entry', 'client', 'index')
      },
      server: {
        application: resolveAppFile(
          'application',
          ssr ? 'create-application-server' : 'create-application-server-spa'
        ),
        entry: resolveAppFile('entry', 'server', 'index')
      }
    });
    api.addAppExport(resolveAppFile('helper/getPageData'), '{ getPageData }');
    api.addEntryCode(`import '${resolveAppFile('entry', 'client', 'index')}'`);
  }
}

export default new CoreRuntime();
