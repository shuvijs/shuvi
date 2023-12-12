import routes from '@shuvi/app/files/routes';
import { getRoutes, app as AppComponent } from '@shuvi/app/core/platform';
import {
  runLoaders,
  createLoaderContext,
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
import { SERVER_CREATE_APP } from '@shuvi/shared/constants/trace';
import logger from '@shuvi/utils/logger';
import { CreateAppServer, InternalApplication } from '../../shared';
import { serializeServerError } from '../helper/serializeServerError';

const { SHUVI_SERVER_RUN_LOADERS } = SERVER_CREATE_APP.events;
export const createApp: CreateAppServer = options => {
  const { req, ssr, basename } = options;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });
  const router = createRouter({
    history,
    routes: getRoutes(routes),
    basename
  }) as IRouter;
  let app: InternalApplication;
  if (ssr) {
    router.beforeResolve(async (to, from, next) => {
      const { serverCreateAppTrace } = req._traces;
      const runLoadersTrace = serverCreateAppTrace.traceChild(
        SHUVI_SERVER_RUN_LOADERS.name,
        { [SHUVI_SERVER_RUN_LOADERS.attrs.requestId.name]: req._requestId }
      );
      const pageLoaders = await app.getLoaders();
      const matches = getRouteMatchesWithInvalidLoader(to, from, pageLoaders);
      const loaderContext = createLoaderContext({
        req,
        pathname: to.pathname,
        query: to.query,
        params: to.params,
        getAppContext: () => app.context
      });
      try {
        const loaderResult = await runLoaders(
          matches,
          pageLoaders,
          loaderContext
        );
        app.setLoadersData(loaderResult);
        runLoadersTrace.setAttribute(
          SHUVI_SERVER_RUN_LOADERS.attrs.error.name,
          false
        );
        runLoadersTrace.stop();
      } catch (error: any) {
        runLoadersTrace.setAttribute(
          SHUVI_SERVER_RUN_LOADERS.attrs.error.name,
          true
        );
        if (isRedirect(error)) {
          const location = error.headers.get('Location')!;
          const status = error.status;
          // server side redirect is different from regular route redirect because it has the extra data - statusCode
          // So it won't change route target, but just store the redirect location in state
          next({
            path: pathToString(to),
            replace: true,
            skipGuards: true,
            state: {
              location,
              status
            }
          });
          runLoadersTrace.setAttribute(
            SHUVI_SERVER_RUN_LOADERS.attrs.errorType.name,
            'redirect'
          );
          runLoadersTrace.stop();
          return;
        }

        if (isResponse(error) && error.status >= 400 && error.status < 600) {
          app.setError({
            code: error.status,
            message: error.data
          });
          next();
          runLoadersTrace.setAttribute(
            SHUVI_SERVER_RUN_LOADERS.attrs.errorType.name,
            'userError'
          );
          runLoadersTrace.stop();
          return;
        }
        logger.error(error.stack);
        app.setError(serializeServerError(error));
        next();
        runLoadersTrace.setAttribute(
          SHUVI_SERVER_RUN_LOADERS.attrs.errorType.name,
          'unexpectedError'
        );
        runLoadersTrace.stop();
        return;
      }

      next();
    });
  }

  app = application({
    AppComponent,
    router,
    request: req,
    config: {
      ssr
    }
  });

  return app;
};
