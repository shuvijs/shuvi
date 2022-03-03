import { createPlugin, PluginInstance } from '@shuvi/runtime-core';
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
