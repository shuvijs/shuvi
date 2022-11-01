import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  isResponse,
  isRedirect
} from '@shuvi/platform-shared/shared';
import pageLoaders from '@shuvi/app/files/page-loaders';
import application from '@shuvi/platform-shared/shuvi-app/application';
import { createRouter, createMemoryHistory, IRouter } from '@shuvi/router';
import logger from '@shuvi/utils/lib/logger';
import { CreateAppServer, InternalApplication } from '../../shared';
import { serializeServerError } from '../helper/serializeServerError';

export const createApp: CreateAppServer = options => {
  const { req, ssr } = options;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const router = createRouter({
    history,
    routes: getRoutes(routes)
  }) as IRouter;
  let app: InternalApplication;
  if (ssr) {
    router.beforeResolve(async (to, from, next) => {
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      try {
        const loaderResult = await runLoaders(matches, pageLoaders, {
          req,
          query: to.query,
          getAppContext: () => app.context
        });
        app.setLoadersData(loaderResult);
      } catch (error: any) {
        if (isRedirect(error)) {
          next({
            path: error.headers.get('Location')!,
            skipGuards: true
          });
          return;
        }

        if (isResponse(error) && error.status >= 400 && error.status < 600) {
          app.setError({
            code: error.status,
            message: error.data
          });
          next();
          return;
        }
        if (process.env.NODE_ENV === 'development') {
          logger.error(error.stack);
        }
        app.setError(serializeServerError(error));
        next();
        return;
      }

      next();
    });
  }

  app = application({
    AppComponent,
    router,
    config: {
      ssr
    }
  });

  return app;
};
