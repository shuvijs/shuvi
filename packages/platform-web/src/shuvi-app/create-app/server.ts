import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  IAppRenderFn,
  IServerUserContext,
  IAppRouteConfig,
  getModelManager,
  IApplication
} from '@shuvi/platform-shared/esm/runtime';
import platform from '@shuvi/platform-shared/esm/runtime/platform';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import { IRequest } from '@shuvi/service/lib/server';

export function createApp<
  Router extends IRouter<IAppRouteConfig>,
  CompType
>(options: {
  render: IAppRenderFn<IServerUserContext, CompType>;
  req: IRequest;
}): IApplication {
  const { req } = options;
  const modelManager = getModelManager();
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const context = { req };
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
