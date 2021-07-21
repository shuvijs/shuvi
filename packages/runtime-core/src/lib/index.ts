import { IApi } from '@shuvi/types';
import path from 'path';

const PACKAGE_DIR = path.dirname(
  require.resolve('@shuvi/runtime-core/package.json')
);

const resolveAppFile = (...paths: string[]) =>
  `${path.join(PACKAGE_DIR, 'shuvi-app', ...paths)}`;

const entryModule = resolveAppFile('entry');

class CoreRuntime {
  async install(api: IApi): Promise<void> {
    // todo: move to core
    api.addEntryCode(`import "${entryModule}"`);
    api.addAppService(
      resolveAppFile('helper/getPageData'),
      '{ getPageData }',
      'getPageData',
      true
    );
  }
}

export default new CoreRuntime();
