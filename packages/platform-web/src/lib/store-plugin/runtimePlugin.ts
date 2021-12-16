import { createPlugin } from '@shuvi/runtime-core/lib/runtimeHooks';
import { createStore } from '@modern-js-reduck/store';
import { withRedux } from './withRedux';

export default createPlugin({
  appComponent: async (App, appContext) => {
    return withRedux(App, appContext)
  },
  context: (ctx) => {
    if (!ctx.store) {
      let initialState = {};
      if (ctx.pageData && ctx.pageData.redux) {
        initialState = ctx.pageData.redux;
      }
      ctx.store = createStore({
        initialState
      });
    }
    // console.log('appContext', ctx)
    return ctx
  },
})
