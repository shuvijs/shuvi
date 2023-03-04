import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  runLoaders,
  getRouteMatchesWithInvalidLoader,
  isResponse,
  isRedirect
} from '@shuvi/platform-shared/shared';
import application from '@shuvi/platform-shared/shuvi-app/application';
import {
  createRouter,
  createMemoryHistory,
  IRouter,
  pathToString
} from '@shuvi/router';
import logger from '@shuvi/utils/logger';
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
      const pageLoaders = await app.getLoaders();
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      try {
        const loaderResult = await runLoaders(matches, pageLoaders, {
          req,
          pathname: to.pathname,
          query: to.query,
          params: to.params,
          getAppContext: () => app.context
        });
        app.setLoadersData(loaderResult);
      } catch (error: any) {
        if (isRedirect(error)) {
          const location = error.headers.get('Location')!;
          const status = error.status;
          next({
            path: pathToString(to),
            replace: true,
            skipGuards: true,
            state: {
              location,
              status
            }
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
