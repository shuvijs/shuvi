import { IStoreManager } from '@shuvi/redox';
import { createRuntimePluginAfter } from '@shuvi/platform-shared/shared';
import { RedoxWrapper } from './RedoxWrapper';

declare module '@shuvi/runtime' {
  interface CustomAppContext {
    store: IStoreManager;
  }
}

// this needs to be run last
export default createRuntimePluginAfter(
  {
    appComponent: async (App, appContext) => {
      return RedoxWrapper(App, {
        store: appContext.store
      });
    }
  },
  {
    name: 'model-react'
  }
);
