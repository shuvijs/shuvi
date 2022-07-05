import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  Application,
  getModelManager,
  CreateServerApp,
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  isRedirect,
  isError,
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
  const modelManager = getModelManager();
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as IRouter;
  let app: Application;
  const loaderManager = getLoaderManager();
  const error = getErrorHandler(modelManager);

  if (ssr) {
    router.beforeResolve(async (to, from, next) => {
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      const loaderResult = await runLoaders(matches, pageLoaders, {
        isServer: true,
        req,
        query: to.query,
        getAppContext: () => app.context
      });

      if (isRedirect(loaderResult)) {
        next(loaderResult.headers.get('Location')!);
        return;
      }

      if (isError(loaderResult)) {
        error.errorHandler({
          code: loaderResult.status,
          message: loaderResult.data
        });
        next();
        return;
      }

      loaderManager.setDatas(loaderResult);

      next();
    });
  }

  app = application({
    AppComponent,
    router,
    modelManager
  });

  return app;
};
