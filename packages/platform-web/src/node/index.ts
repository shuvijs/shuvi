import { IPlatform } from '@shuvi/service';
import {
  SharedPlugins,
  getPresetRuntimeFilesCreator
} from '@shuvi/platform-shared/node';
import {
  featurePlugins,
  getMiddlewares,
  getMiddlewaresBeforeDevMiddlewares,
  getMainPlugin
} from './features';
import { resolvePkgFile } from './paths';

export { PlatformWebCustomConfig } from '../shared/configTypes';

const platform =
  ({ framework = 'react' } = {}): IPlatform =>
  async platformContext => {
    const mainPlugin = getMainPlugin(platformContext);

    const platformFramework = require(`./targets/${framework}`).default;
    const platformFrameworkContent = await platformFramework();

    const platformModule = platformFrameworkContent.platformModule as string;
    const polyfills = platformFrameworkContent.polyfills as string[];

    const getPresetRuntimeFiles = getPresetRuntimeFilesCreator(
      platformModule,
      polyfills
    );

    return {
      types: [
        resolvePkgFile('shuvi-env.d.ts'),
        resolvePkgFile('shuvi-image.d.ts')
      ],
      plugins: [
        ...SharedPlugins,
        mainPlugin,
        ...featurePlugins,
        ...platformFrameworkContent.plugins
      ],
      getPresetRuntimeFiles,
      getMiddlewares,
      getMiddlewaresBeforeDevMiddlewares
    };
  };

export default platform;
