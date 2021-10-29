import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import {
  IApplication,
  getAppStore,
  getErrorHandler,
  IAppState,
  IAppRenderFn,
  IApplicationCreaterClientContext,
  IAppRouteConfig
} from '@shuvi/platform-core';
import platform from '@shuvi/platform-core/lib/platform';
import { createRouter, IRouter } from '@shuvi/router';
import { History } from '@shuvi/router/lib/types';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
declare let __SHUVI: any;
let app: IApplication;
let history: History;
let appContext: IApplicationCreaterClientContext;
let appRouter: IRouter<IAppRouteConfig>;

export const createFactory = (historyCreater: () => History) => {
  return function create<
    Context extends IApplicationCreaterClientContext,
    Router extends IRouter<IAppRouteConfig>,
    CompType,
    AppState extends IAppState
  >(
    context: Context,
    options: {
      render: IAppRenderFn<Context, Router, CompType>;
      appState?: AppState;
    }
  ) {
    // app is a singleton in client side
    if (app) {
      return app;
    }
    history = historyCreater();
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
    app = platform({
      AppComponent,
      router,
      context,
      appState: options.appState,
      render: options.render
    });
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
