import { Api, IRequestHandlerWithNext } from '@shuvi/service';
import { matchPathname } from '@shuvi/router';

import { apiRouteHandler, IApiRequestHandler } from './apiRouteHandler';

interface IApiModule {
  default: IApiRequestHandler;
  config?: {
    apiConfig?: {
      bodyParser?: { sizeLimit: number | string } | boolean;
    };
  };
}

export function getApiRoutesMiddleware(api: Api): IRequestHandlerWithNext {
  return async function (req, res, next) {
    const { apiRoutes } = api.resources.server;
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
          tempApiModule as unknown as IApiModule;
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
