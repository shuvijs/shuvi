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

const platform: IPlatform = async (
  { framework = 'react' } = {},
  platformContext
) => {
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
    types: '@shuvi/platform-web/esm/node/types/shuvi-service',
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
