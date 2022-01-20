import { createServerPlugin, IUserRouteConfig } from '@shuvi/service';
import { getApiRoutesMiddleware } from './apiRoute';
import { getMiddlewareRoutesMiddleware } from './middlewareRoute';
import { getSSRMiddleware } from './SSR';
import OnDemandRouteManager from './onDemandRouteManager'

export type ServerOptions = {
  routes: IUserRouteConfig[]
}

export default (options: ServerOptions) => {
  let onDemandRouteManager: OnDemandRouteManager
  return createServerPlugin({
    serverMiddlewareBeforeDevMiddleware: (devMiddleware, context) => {
      onDemandRouteManager = new OnDemandRouteManager(context, options)
      onDemandRouteManager.devMiddleware = devMiddleware
      return onDemandRouteManager.getServerMiddleware()
    },
    // onDemandRouteManager will be undefined in production mode
    serverMiddleware: () => onDemandRouteManager ? onDemandRouteManager.ensureRoutesMiddleware() : [],
    serverMiddlewareLast: context => {
      return [
        getApiRoutesMiddleware(context),
        getMiddlewareRoutesMiddleware(context),
        getSSRMiddleware(context)
      ];
    }
  });
}
