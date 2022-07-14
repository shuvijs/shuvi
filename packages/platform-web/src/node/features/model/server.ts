import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  getPageData: appContext => {
    const { storeManager } = appContext;
    delete appContext.storeManager;
    return {
      redox: storeManager?.getState()
    };
  }
}) as ServerPluginInstance;
