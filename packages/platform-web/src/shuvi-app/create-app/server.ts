import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  IAppRenderFn,
  IServerAppContext,
  IPageRouteRecord,
  IApplication,
  getModelManager
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import { IRequest } from '@shuvi/service/lib/server';

export function createServerApp<
  Router extends IRouter<IPageRouteRecord>,
  CompType
>(options: {
  render: IAppRenderFn<IServerAppContext, CompType>;
  req: IRequest;
}): IApplication {
  const { req } = options;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as Router;
  return application({
    AppComponent: PlatformAppComponent,
    router,
    modelManager: getModelManager(),
    render: options.render,
    UserAppComponent,
    req
  });
}
