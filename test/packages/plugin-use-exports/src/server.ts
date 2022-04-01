import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  onListen: () => {
    console.warn('plugin-use-exports server');
  }
}) as ServerPluginInstance;
