import {
  createRuntimePlugin,
  RuntimePluginInstance
} from '@shuvi/platform-shared/shared';

export default createRuntimePlugin({
  init: () => {
    console.warn('plugin-no-exports runtime');
  }
}) as RuntimePluginInstance;
