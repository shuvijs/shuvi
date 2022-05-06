import { IPlatform, resolvePlugin } from '@shuvi/service';

import {
  sharedPlugin,
  getPresetRuntimeFilesCreator
} from '@shuvi/platform-shared/lib/platform';
import { resolveAppFile } from './paths';

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
  const entry = `import "${resolveAppFile('entry', 'client')}"`;
  const polyfills = platformFrameworkContent.polyfills as string[];

  const getPresetRuntimeFiles = getPresetRuntimeFilesCreator(
    platformModule,
    entry,
    polyfills
  );
  const modelPlugin = resolvePlugin('@shuvi/plugins/model', { dir: __dirname });
  return {
    plugins: [
      mainPlugin,
      modelPlugin,
      sharedPlugin,
      ...featurePlugins,
      ...platformFrameworkContent.plugins
    ],
    getPresetRuntimeFiles,
    getMiddlewares,
    getMiddlewaresBeforeDevMiddlewares
  };
};

export default platform;
