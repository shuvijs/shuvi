const applicationJsFile = `import AppComponent from "@shuvi/app/core/app";
import routes from "@shuvi/app/core/routes";
import { getRoutes } from "@shuvi/app/core/platform";
import initPlugins from "@shuvi/app/user/plugin";
import { pluginRecord } from "@shuvi/app/core/plugins";
import { Application } from "@shuvi/core/lib/app/app-modules/application";
import runPlugins from "@shuvi/core/lib/app/app-modules/runPlugins";
import { createRouter, createBrowserHistory, createHashHistory, createMemoryHistory } from '@shuvi/router';

let app;
let history;
let appContext;
export function create(context, options) {
  // app is a singleton in client side
  if (app) {
    return app;
  }
  const { historyMode } = context;
  switch (historyMode) {
    case 'browser':
      history = createBrowserHistory();
      break;
    case 'hash':
      history = createHashHistory();
      break;
    default:
      history = createMemoryHistory({
        initialEntries: ['/'],
        initialIndex: 0
      })
  }
  
  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  })
  app = new Application({
    AppComponent,
    router,
    context,
    render: options.render
  });

  runPlugins({
    tap: app.tap.bind(app),
    initPlugins,
    pluginRecord,
  });

  return app;
}

if (module.hot) {
  module.hot.accept(['@shuvi/app/main.client','@shuvi/app/core/app', '@shuvi/app/core/routes', '@shuvi/app/user/plugin'],async ()=>{
    const rerender = () => {
      const AppComponent = require('@shuvi/app/core/app').default;
      const routes = require('@shuvi/app/core/routes').default;
      const router = createRouter({
        history,
        routes: getRoutes(routes, appContext)
      });
      app.rerender({ router, AppComponent });
    }
    // to solve routing problem, we need to rerender routes
    // wait navigation complete only rerender to ensure getInitialProps is called
    if (__SHUVI.router._pending) {
      const removelistener = __SHUVI.router.afterEach(()=>{
        rerender();
        removelistener();
      })
    } else {
      rerender();
    }
  })
}
`;

export default {
  content: () => applicationJsFile
};
