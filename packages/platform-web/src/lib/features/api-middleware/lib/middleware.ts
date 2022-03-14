import { IServerPluginContext, IRequestHandlerWithNext } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import { server } from '@shuvi/service/lib/resources';
import { apiRouteHandler } from './apiRouteHandler';

export function middleware(api: IServerPluginContext): IRequestHandlerWithNext {
  return async function (req, res, next) {
    const { apiRoutes } = server;
    const { prefix, ...otherConfig } = api.config.apiConfig || {};
    if (!req.url.startsWith(prefix!)) {
      return next();
    }
    let tempApiModule;
    for (const { path, apiModule } of apiRoutes) {
      const match = matchPathname(path, req.pathname);
      if (match) {
        req.params = match.params;
        tempApiModule = apiModule;
        break;
      }
    }
    if (tempApiModule) {
      try {
        const { config: { apiConfig = {} } = {}, default: resolver } =
          tempApiModule;
        let overridesConfig = {
          ...otherConfig,
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
