import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  Application,
  getStoreManager,
  CreateServerApp,
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  Response,
  isRedirect,
  isError,
  isResponse,
  getLoaderManager,
  getErrorHandler
} from '@shuvi/platform-shared/esm/runtime';
import pageLoaders from '@shuvi/app/files/page-loaders';
import application from '@shuvi/platform-shared/esm/shuvi-app/application';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';

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
  const loaderManager = getLoaderManager();
  const error = getErrorHandler(storeManager);

  if (ssr) {
    router.beforeResolve(async (to, from, next) => {
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      const loaderDatas = await runLoaders(matches, pageLoaders, {
        isServer: true,
        req,
        query: to.query,
        getAppContext: () => app.context
      });

      for (let index = 0; index < loaderDatas.length; index++) {
        const data = loaderDatas[index];
        if (isRedirect(data)) {
          loaderManager.clearAllData();
          next(data.headers.get('Location')!);
          return;
        }

        if (isError(data)) {
          loaderManager.clearAllData();
          error.errorHandler({
            code: (data as Response).status,
            message: (data as Response).data
          });
          next();
          return;
        }

        if (isResponse(data)) {
          loaderManager.setData(
            matches[index].route.id,
            (data as Response).data
          );
        } else {
          loaderManager.setData(matches[index].route.id, undefined);
        }
      }

      next();
    });
  }

  app = application({
    AppComponent,
    router,
    storeManager
  });
  router.init();

  return app;
};
