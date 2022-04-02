import { createPlugin, CorePluginInstance } from '@shuvi/service';

export default createPlugin({
  afterInit: () => {
    console.warn('plugin-no-exports core');
  }
}) as CorePluginInstance;
