import { IServerPluginContext, ShuviRequestHandler } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import resources from '@shuvi/service/lib/resources';
import { SERVER_REQUEST } from '@shuvi/shared/constants/trace';

const { SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES } = SERVER_REQUEST.events;

export function middleware(_api: IServerPluginContext): ShuviRequestHandler {
  const { serverCreateAppTrace } = _api.traces;
  return async function (req, res, next) {
    const middlewareRoutesTrace = serverCreateAppTrace.traceChild(
      SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.name
    );
    try {
      const { middlewareRoutes = [] } = resources.server;
      // match path for get middlewares
      let middlewares: ShuviRequestHandler[] = [];

      for (let i = 0; i < middlewareRoutes.length; i++) {
        const middlewareRoute = middlewareRoutes[i];
        const match = matchPathname(middlewareRoute.path, req.pathname);
        if (match) {
          req.params = match.params;
          middlewares.push(middlewareRoutes[i].middleware.default);
        }
      }

      // run middlewares
      let i = 0;
      const runNext = () => runMiddleware(middlewares[++i]);

      const runMiddleware = async (middleware: ShuviRequestHandler) => {
        if (i === middlewares.length) {
          /** Most request should end here */
          middlewareRoutesTrace.setAttributes({
            [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.error.name]: false,
            [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.statusCode.name]:
              res.statusCode,
            [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.headersSent.name]:
              res.headersSent
          });
          middlewareRoutesTrace.stop();
          return next();
        }
        try {
          await middleware(req, res, runNext);
        } catch (err) {
          /** Catch error from single middleware */
          middlewareRoutesTrace.setAttributes({
            [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.error.name]: true,
            [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.statusCode.name]: 500, // status code should be 500
            [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.headersSent.name]:
              res.headersSent
          });
          middlewareRoutesTrace.stop();
          return next(err);
        }
      };

      return await runMiddleware(middlewares[i]);
    } catch (err) {
      /** Catch error from the whole function */
      middlewareRoutesTrace.setAttributes({
        [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.error.name]: true,
        [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.statusCode.name]: 500, // status code should be 500
        [SHUVI_SERVER_RUN_MIDDLEWARE_ROUTES.attrs.headersSent.name]:
          res.headersSent
      });
      middlewareRoutesTrace.stop();
      return next(err);
    }
  };
}
