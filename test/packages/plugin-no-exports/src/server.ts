import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  listen: () => {
    console.warn('plugin-no-exports server');
  }
}) as ServerPluginInstance;
