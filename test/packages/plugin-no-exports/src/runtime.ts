import {
  createPlugin,
  RuntimePluginInstance
} from '@shuvi/platform-shared/shared';

export default createPlugin({
  init: () => {
    console.warn('plugin-no-exports runtime');
  }
}) as RuntimePluginInstance;
