import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import {
  Application,
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext,
  IAppRouteConfig
} from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';

export function create<
  Context extends IApplicationCreaterServerContext,
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
  const { req } = context;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });

  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  }) as Router;

  const app = new Application({
    AppComponent,
    router,
    context,
    appState: options.appState,
    render: options.render
  });
  runPlugins(app);

  return app;
}
