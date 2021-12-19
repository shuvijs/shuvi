import { IPluginContext, IRequestHandlerWithNext } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';
import { apiRouteHandler } from './apiRouteHandler';
import { IBuiltResource } from '../types';

export function getApiRoutesMiddleware(
  api: IPluginContext
): IRequestHandlerWithNext {
  return async function (req, res, next) {
    const { apiRoutes } = api.resources.server as IBuiltResource['server'];
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
