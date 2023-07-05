import { IPlatform } from '@shuvi/service';
import {
  SharedPlugins,
  getPresetRuntimeFilesCreator
} from '@shuvi/platform-shared/node';
import tracePlugin from './trace';
import externalInternalLibs from './external-internal-libs';
import {
  getPlugins,
  getMiddlewares,
  getMiddlewaresBeforeDevMiddlewares
} from './features';
import { resolvePkgFile } from './paths';

export * from '../shared';

export { PlatformWebCustomConfig } from '../shared/configTypes';

const platform =
  ({ framework = 'react' } = {}): IPlatform =>
  async platformContext => {
    const platformFramework = require(`./targets/${framework}`).default;
    const platformFrameworkContent = await platformFramework();

    const platformModule = platformFrameworkContent.platformModule as string;
    const getPresetRuntimeFiles = getPresetRuntimeFilesCreator(platformModule);

    return {
      types: [
        resolvePkgFile('shuvi-env.d.ts'),
        resolvePkgFile('shuvi-image.d.ts')
      ],
      plugins: [
        externalInternalLibs,
        tracePlugin,
        ...SharedPlugins,
        ...getPlugins(platformContext),
        ...platformFrameworkContent.plugins
      ],
      getPresetRuntimeFiles,
      getMiddlewares,
      getMiddlewaresBeforeDevMiddlewares
    };
  };

export default platform;
