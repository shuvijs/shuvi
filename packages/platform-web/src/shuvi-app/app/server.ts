import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  Application,
  CreateServerApp,
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  isRedirect,
  isError,
  getLoaderManager
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
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as IRouter;
  let app: Application;
  const loaderManager = getLoaderManager();

  if (ssr) {
    router.beforeResolve(async (to, from, next) => {
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      const loaderResult = await runLoaders(matches, pageLoaders, {
        isServer: true,
        req,
        query: to.query,
        appContext: () => app.context
      });

      if (isRedirect(loaderResult)) {
        next(loaderResult.headers.get('Location')!);
        return;
      }

      if (isError(loaderResult)) {
        app.error.error({
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
    router
  });

  return app;
};
