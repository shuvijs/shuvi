import {
  createPlugin,
  RuntimePluginInstance
} from '@shuvi/platform-shared/shared';

export default createPlugin({
  init: () => {
    console.warn('plugin-use-exports runtime');
  }
}) as RuntimePluginInstance;
