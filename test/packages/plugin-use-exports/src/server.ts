import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  listen: () => {
    console.warn('plugin-use-exports server');
  }
}) as ServerPluginInstance;
