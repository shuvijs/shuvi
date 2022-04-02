import {
  createPlugin,
  PluginInstance
} from '@shuvi/platform-shared/lib/runtime';

export default createPlugin({
  init: () => {
    console.warn('plugin-use-exports runtime');
  }
}) as PluginInstance;
