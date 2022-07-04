import UserAppComponent from '@shuvi/app/user/app';
import routes from '@shuvi/app/files/routes';
import {
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import {
  Application,
  getStoreManager,
  CreateServerApp
} from '@shuvi/platform-shared/esm/runtime';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import { getLoadersAndPreloadHook } from '../loader';

export const createApp: CreateServerApp = options => {
  const { req, ssr } = options;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const storeManager = getStoreManager();
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as IRouter;
  let app: Application;

  if (ssr) {
    router.beforeResolve(
      getLoadersAndPreloadHook(storeManager, {
        req,
        getAppContext: () => app.context
      })
    );
  }

  app = application({
    AppComponent: PlatformAppComponent,
    router,
    storeManager,
    UserAppComponent
  });
  router.init();

  return app;
};
