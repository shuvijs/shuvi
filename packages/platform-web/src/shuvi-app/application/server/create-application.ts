import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import { Application, getAppStore, IAppState } from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import { IAppRenderFn } from '@shuvi/runtime-core';
import { Store } from '@shuvi/shared/lib/miniRedux';

export function create<
  Context extends { req: any },
  Router extends IRouter<any>,
  AppState extends IAppState
>(
  context: Context,
  options: {
    render: IAppRenderFn<Context, Router, Store>;
    appState?: AppState;
  }
) {
  const { req } = context;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });

  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  }) as Router;

  const appStore = getAppStore(options.appState);

  const app = new Application({
    AppComponent,
    router,
    appStore,
    context,
    render: options.render
  });
  runPlugins(app);

  return app;
}
