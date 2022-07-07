import { IStoreManager } from '@shuvi/redox';
import { createPlugin } from '@shuvi/platform-shared/lib/runtime';
import { RedoxWrapper } from './RedoxWrapper';

export default createPlugin({
  appComponent: async (App, appContext) => {
    return RedoxWrapper(App, appContext as { storeManager: IStoreManager });
  }
});
