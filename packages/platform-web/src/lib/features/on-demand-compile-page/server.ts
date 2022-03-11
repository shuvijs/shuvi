import { createServerPlugin } from '@shuvi/service';
import OnDemandRouteManager from './onDemandRouteManager';

let onDemandRouteManager: OnDemandRouteManager;

export default createServerPlugin({
  addMiddlewareBeforeDevMiddleware: (devMiddleware, context) => {
    onDemandRouteManager = new OnDemandRouteManager(context);
    onDemandRouteManager.devMiddleware = devMiddleware;
    return onDemandRouteManager.getServerMiddleware();
  },
  addMiddleware() {
    return [
      onDemandRouteManager && onDemandRouteManager.ensureRoutesMiddleware()
    ].filter(Boolean);
  }
});
