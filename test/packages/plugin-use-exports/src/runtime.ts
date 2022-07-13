import {
  createRuntimePlugin,
  RuntimePluginInstance
} from '@shuvi/platform-shared/shared';

export default createRuntimePlugin({
  init: () => {
    console.warn('plugin-use-exports runtime');
  }
}) as RuntimePluginInstance;
