import {
  createPlugin,
  PluginInstance,
  IRuntimeModule
} from '@shuvi/platform-shared/lib/runtime';
import { init } from '@shuvi/redox';

import { withRedux } from './withRedux';

export default createPlugin({
  getAppComponent: async (App, appContext) => {
    return withRedux(App, appContext);
  },
  getAppContext: ctx => {
    if (!ctx.store) {
      let initialState = {};
      if (ctx.pageData && ctx.pageData.redux) {
        initialState = ctx.pageData.redux;
      }
      ctx.store = init({
        name: 'GlobalStore',
        redux: {
          initialState
        },
        plugins: []
      });
    }
    return ctx;
  }
}) as PluginInstance;

export const getAppContext: IRuntimeModule['getAppContext'] = context => {
  return context;
};
