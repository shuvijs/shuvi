import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  IApplication,
  getAppStore,
  getErrorHandler,
  IAppState
} from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { createRouter, IRouter } from '@shuvi/router';
import { History } from '@shuvi/router/lib/types';
import { Runtime } from '@shuvi/service';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Store } from '@shuvi/shared/lib/miniRedux';
import { IAppRenderFn } from '@shuvi/runtime-core';
declare let __SHUVI: any;
let app: IApplication;
let history: History;
let appContext: Runtime.IApplicationCreaterContext;
let appRouter: IRouter<Runtime.IAppRouteConfig>;

export const createFactory = (historyCreater: () => History) => {
  return function create<
    Context,
    Router extends IRouter<any>,
    AppState extends IAppState
  >(
    context: Context,
    options: {
      render: IAppRenderFn<Context, Router, Store>;
      appState?: AppState;
    }
  ) {
    // app is a singleton in client side
    if (app) {
      return app;
    }
    history = historyCreater();
    const appStore = getAppStore(options.appState);
    const router = createRouter({
      history,
      routes: getRoutes(routes, context)
    }) as Router;
    router.afterEach(_current => {
      if (!_current.matches) {
        getErrorHandler(getAppStore()).errorHandler(
          SHUVI_ERROR_CODE.PAGE_NOT_FOUND
        );
      }
    });
    appRouter = router;
    appContext = context;
    app = new Application({
      AppComponent,
      router,
      appStore,
      context,
      render: options.render
    });
    runPlugins(app);

    return app;
  };
};

if (module.hot) {
  module.hot.accept(
    [
      '@shuvi/app/entry.client',
      '@shuvi/app/core/app',
      '@shuvi/app/core/routes',
      '@shuvi/app/user/plugin'
    ],
    async () => {
      const rerender = () => {
        const AppComponent = require('@shuvi/app/core/app').default;
        const routes = require('@shuvi/app/core/routes').default;
        appRouter.replaceRoutes(getRoutes(routes, appContext));
        app.rerender({ AppComponent });
      };
      // to solve routing problem, we need to rerender routes
      // wait navigation complete only rerender to ensure getInitialProps is called
      if (__SHUVI.router._pending) {
        const removelistener = __SHUVI.router.afterEach(() => {
          rerender();
          removelistener();
        });
      } else {
        rerender();
      }
    }
  );
}
