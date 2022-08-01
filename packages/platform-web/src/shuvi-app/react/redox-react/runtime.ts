import { createRuntimePlugin } from '@shuvi/platform-shared/shared';
import { RedoxWrapper } from './RedoxWrapper';

export default createRuntimePlugin({
  appComponent: async (App, appContext) => {
    return RedoxWrapper(App, {
      storeManager: appContext.store
    });
  }
});
