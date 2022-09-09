import { IServerPluginContext, ShuviRequestHandler } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import resources from '@shuvi/service/lib/resources';
import { apiRouteHandler } from './apiRouteHandler';

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
      try {
        const { config, default: resolver } = tempApiModule;

        await apiRouteHandler(
          req,
          res,
          resolver,
          config?.api || { bodyParser: true }
        );
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  };
}
