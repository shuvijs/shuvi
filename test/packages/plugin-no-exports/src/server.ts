import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  onListen: () => {
    console.warn('plugin-no-exports server');
  }
}) as ServerPluginInstance;
