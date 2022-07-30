import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  getPageData: appContext => {
    const { store } = appContext;
    return {
      shuviInitialState: store.getState()
    };
  }
}) as ServerPluginInstance;
