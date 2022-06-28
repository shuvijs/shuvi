import { IServerPluginContext, IRequestHandlerWithNext } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import { server } from '@shuvi/service/lib/resources';
import { apiRouteHandler } from './apiRouteHandler';

export function middleware(ctx: IServerPluginContext): IRequestHandlerWithNext {
  return async function (req, res, next) {
    const { apiRoutes } = server;
    const commonApiConfig = ctx.config.apiConfig || {};
    let tempApiModule;
    for (const { path, handler } of apiRoutes) {
      const match = matchPathname(path, req.pathname);
      if (match) {
        req.params = match.params;
        tempApiModule = handler;
        break;
      }
    }
    if (tempApiModule) {
      try {
        const { config: { apiConfig = {} } = {}, default: resolver } =
          tempApiModule;
        let overridesConfig = {
          ...commonApiConfig,
          ...apiConfig
        };

        await apiRouteHandler(req, res, resolver, overridesConfig);
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  };
}
