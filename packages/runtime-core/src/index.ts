import { IApi } from '@shuvi/types';
import path from 'path';

export const PACKAGE_DIR = path.dirname(
  require.resolve('@shuvi/runtime-core/package.json')
);

export const resolveDist = (...paths: string[]) =>
  `${path.join(PACKAGE_DIR, 'lib', ...paths)}`;

const entryModule = resolveDist('entry');

class CoreRuntime {
  async install(api: IApi): Promise<void> {
    api.addEntryCode(`import "${entryModule}"`);
    api.addAppExport(
      require.resolve('@shuvi/runtime-core/lib/lib/getPageData'),
      '{ getPageData }'
    );
  }
}

export default new CoreRuntime();
