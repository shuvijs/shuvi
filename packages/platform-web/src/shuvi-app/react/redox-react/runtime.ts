import { IStoreManager } from '@shuvi/redox';
import { createRuntimePlugin } from '@shuvi/platform-shared/shared';
import { RedoxWrapper } from './RedoxWrapper';

declare module '@shuvi/runtime' {
  interface CustomAppContext {
    store: IStoreManager;
  }
}

export default createRuntimePlugin({
  appComponent: async (App, appContext) => {
    return RedoxWrapper(App, {
      storeManager: appContext.store
    });
  }
});
