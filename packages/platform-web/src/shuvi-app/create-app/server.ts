import getUserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext,
  IAppRouteConfig,
  getAppStore
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';

export function createApp<
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
  const appStore = getAppStore(options.appState);
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
    appStore,
    render: options.render,
    getUserAppComponent
  });
}
