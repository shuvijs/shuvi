import {
  createPlugin,
  RuntimePluginInstance
} from '@shuvi/platform-shared/src/shared';

export default createPlugin({
  init: () => {
    console.warn('plugin-no-exports runtime');
  }
}) as RuntimePluginInstance;
