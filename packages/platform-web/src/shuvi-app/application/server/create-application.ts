import getUserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext,
  IAppRouteConfig
} from '@shuvi/platform-core';
import platform from '@shuvi/platform-core/lib/platform';
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

  return platform({
    AppComponent,
    router,
    context,
    appState: options.appState,
    render: options.render,
    getUserAppComponent
  });
}
