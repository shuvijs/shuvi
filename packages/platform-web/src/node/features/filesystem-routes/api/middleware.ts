import { IServerPluginContext, IRequestHandlerWithNext } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import { server } from '@shuvi/service/lib/resources';
import { apiRouteHandler } from './apiRouteHandler';

export function middleware(
  _ctx: IServerPluginContext
): IRequestHandlerWithNext {
  return async function (req, res, next) {
    const { apiRoutes } = server;
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
        const { config: { api } = {}, default: resolver } = tempApiModule;

        await apiRouteHandler(req, res, resolver, api || { bodyParser: true });
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  };
}
