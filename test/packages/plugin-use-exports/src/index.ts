import { createPlugin, CorePluginInstance } from '@shuvi/service';

export default createPlugin({
  afterInit: () => {
    console.warn('plugin-use-exports core');
  }
}) as CorePluginInstance;
