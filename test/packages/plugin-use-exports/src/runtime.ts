import { createPlugin, RuntimePluginInstance } from '@shuvi/platform-shared/lib/runtime';

export default createPlugin({
  init: () => {
    console.warn('plugin-use-exports runtime');
  }
}) as RuntimePluginInstance;
