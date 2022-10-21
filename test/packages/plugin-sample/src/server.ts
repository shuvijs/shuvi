import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default (option: string) =>
  createServerPlugin({
    listen: () => {
      console.warn(option + 'server');
    }
  }) as ServerPluginInstance;
