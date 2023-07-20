import { IServerPluginContext, ShuviRequestHandler } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import resources from '@shuvi/service/lib/resources';
import { SERVER_REQUEST } from '@shuvi/shared/constants/trace';
import { apiRouteHandler } from './apiRouteHandler';

const { SHUVI_SERVER_RUN_API_MIDDLEWARE } = SERVER_REQUEST.events;

export function middleware(_ctx: IServerPluginContext): ShuviRequestHandler {
  return async function (req, res, next) {
    const { apiRoutes } = resources.server;
    let tempApiModule;
    for (const { path, api } of apiRoutes) {
      const match = matchPathname(path, req.pathname);
      if (match) {
        req.params = match.params;
        tempApiModule = api;
        break;
      }
    }
    if (tempApiModule) {
      const { serverRequestTrace } = req._traces;
      const runApiMiddlewareTrace = serverRequestTrace.traceChild(
        SHUVI_SERVER_RUN_API_MIDDLEWARE.name,
        {
          [SHUVI_SERVER_RUN_API_MIDDLEWARE.attrs.requestId.name]: req._requestId
        }
      );
      try {
        const { config, default: resolver } = tempApiModule;

        await apiRouteHandler(
          req,
          res,
          resolver,
          config?.api || { bodyParser: true }
        );
      } catch (error) {
        runApiMiddlewareTrace.setAttributes({
          [SHUVI_SERVER_RUN_API_MIDDLEWARE.attrs.error.name]: true,
          [SHUVI_SERVER_RUN_API_MIDDLEWARE.attrs.statusCode.name]:
            res.statusCode
        });
        next(error);
      }
      runApiMiddlewareTrace.setAttributes({
        [SHUVI_SERVER_RUN_API_MIDDLEWARE.attrs.error.name]: false,
        [SHUVI_SERVER_RUN_API_MIDDLEWARE.attrs.statusCode.name]: res.statusCode
      });
      runApiMiddlewareTrace.stop();
    } else {
      next();
    }
  };
}
