import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  IAppState,
  IAppRenderFn,
  IApplicationCreaterServerContext,
  IAppRouteConfig,
  getModelManager,
  Application
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
): Application<Context, Router, ReturnType<typeof getModelManager>> {
  const { req } = context;
  const modelManager = getModelManager(options.appState);
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  }) as Router;

  return platform({
    AppComponent: PlatformAppComponent,
    router,
    context,
    modelManager,
    render: options.render,
    UserAppComponent
  });
}
