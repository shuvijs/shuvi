import { createServerPlugin } from '@shuvi/service';
import { getApiRoutesMiddleware } from '../apiRoute';
import { getMiddlewareRoutesMiddleware } from '../middlewareRoute';
import { getSSRMiddleware } from '../ssr';
import OnDemandRouteManager from '../onDemandRouteManager';

export default () => {
  let onDemandRouteManager: OnDemandRouteManager;
  return createServerPlugin({
    addMiddlewareBeforeDevMiddleware: (devMiddleware, context) => {
      onDemandRouteManager = new OnDemandRouteManager(context);
      onDemandRouteManager.devMiddleware = devMiddleware;
      return onDemandRouteManager.getServerMiddleware();
    },
    // onDemandRouteManager will be undefined in production mode
    addMiddleware: context => {
      return [
        ...(onDemandRouteManager
          ? [onDemandRouteManager.ensureRoutesMiddleware()]
          : []),
        getApiRoutesMiddleware(context),
        getMiddlewareRoutesMiddleware(context),
        getSSRMiddleware(context)
      ];
    }
  },
  // internalMiddlewares plugin must be at the end
  { order: 10000, name: 'internalMiddlewares' });
};
