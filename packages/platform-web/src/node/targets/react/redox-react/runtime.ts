import { IStoreManager } from '@shuvi/redox';
import { createPlugin } from '@shuvi/platform-shared/shared';
import { RedoxWrapper } from './RedoxWrapper';

export default createPlugin({
  appComponent: async (App, appContext) => {
    return RedoxWrapper(App, appContext as { storeManager: IStoreManager });
  }
});
