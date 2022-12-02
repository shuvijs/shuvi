import { Doura } from 'doura';
import { createRuntimePluginAfter } from '@shuvi/platform-shared/shared';
import { DouraWrapper } from './Wrapper';

declare module '@shuvi/runtime' {
  interface CustomAppContext {
    store: Doura;
  }
}

// this needs to be run last
export default createRuntimePluginAfter(
  {
    appComponent: async (App, appContext) => {
      return DouraWrapper(App, {
        store: appContext.store
      });
    }
  },
  {
    name: 'model-react'
  }
);
