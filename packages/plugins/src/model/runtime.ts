import {
  createPlugin,
  IRuntimeModule
} from '@shuvi/platform-shared/lib/runtime';
import { redox, IModelManager } from '@shuvi/redox';

import { withRedox } from './withRedox';

let modelManager: IModelManager;

// for client, singleton mode
// for server, return new store
const getModelManager = (initialState: any = {}): IModelManager => {
  // for server
  if (typeof window === 'undefined') {
    return redox(initialState);
  }
  // for client is singleton, just init once
  if (modelManager) {
    return modelManager;
  }

  modelManager = redox(initialState);

  return modelManager;
};

export default createPlugin({
  getAppComponent: async (App, appContext) => {
    return withRedox(App, appContext);
  },
  getAppContext: ctx => {
    if (!ctx.modelManager) {
      let initialState = {};
      if (ctx.pageData && ctx.pageData.redox) {
        initialState = ctx.pageData.redox;
      }
      ctx.modelManager = getModelManager(initialState);
    }
    return ctx;
  }
});

export const getAppContext: IRuntimeModule['getAppContext'] = context => {
  return context;
};
