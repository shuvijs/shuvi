import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  pageData: appContext => {
    const { storeManager } = appContext;
    delete appContext.storeManager;
    return {
      redox: storeManager?.getState()
    };
  }
}) as ServerPluginInstance;
