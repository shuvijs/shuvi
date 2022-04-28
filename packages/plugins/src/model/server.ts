import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';

export default createServerPlugin({
  pageData: appContext => {
    const { modelManager } = appContext;
    delete appContext.modelManager;
    return {
      redox: modelManager?.getChangedState()
    };
  }
}) as ServerPluginInstance;
