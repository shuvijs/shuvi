import { createPlugin } from '@shuvi/runtime-core/lib/runtimeHooks';
import { init } from '../rematch';
import subscriptionsPlugin from '../plugins/subscriptions';
import effectsPlugin from '../plugins/effects';

import { withRedux } from './withRedux';

export default createPlugin({
  appComponent: async (App, appContext) => {
    return withRedux(App, appContext);
  },
  context: ctx => {
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
        plugins: [subscriptionsPlugin(), effectsPlugin()]
      });
    }
    return ctx;
  }
});
