import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import { loaderOptions } from '@shuvi/app/files/routerConfig';

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
import { getLoadersHook } from '../react/utils/router';
export function createApp<
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
  const context = { req };
  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  }) as Router;
  router.beforeResolve(getLoadersHook(context, loaderOptions));
  router.init();
  return application({
    AppComponent: PlatformAppComponent,
    router,
    context,
    modelManager: getModelManager(),
    render: options.render,
    UserAppComponent
  });
}
