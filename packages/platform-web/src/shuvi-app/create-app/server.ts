import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import { loaderOptions } from '@shuvi/app/files/routerConfig';

import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  getModelManager,
  CreateServerApp
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import { getLoadersHook } from '../react/utils/router';

// export function createApp<Router extends IRouter<IPageRouteRecord>>(options: {
export const createApp: CreateServerApp = options => {
  const { req, ssr } = options;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const context = { req };
  const modelManager = getModelManager();
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as IRouter;
  if (ssr) {
    router.beforeResolve(getLoadersHook(context, loaderOptions, modelManager));
  }
  router.init();

  return application({
    AppComponent: PlatformAppComponent,
    router,
    context,
    modelManager,
    UserAppComponent
  });
};
