import { createPlugin, CorePluginInstance } from '@shuvi/service';

export default (option: string) =>
  createPlugin({
    afterInit: () => {
      console.warn(option + 'core');
    }
  }) as CorePluginInstance;
