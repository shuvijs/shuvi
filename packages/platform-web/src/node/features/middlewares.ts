import { IServerPluginContext, IServerMiddleware } from '@shuvi/service';
import { DevMiddleware } from '@shuvi/service/lib/server/middlewares/dev/devMiddleware';

import { OnDemandRouteManager } from './on-demand-compile-page';
import { getApiMiddleware, getMiddlewareMiddleware } from './filesystem-routes';
import { getPageMiddleware } from './html-render';

let onDemandRouteManager: OnDemandRouteManager;

export const getMiddlewares = (
  context: IServerPluginContext
): IServerMiddleware[] => {
  return [
    onDemandRouteManager && onDemandRouteManager.ensureRoutesMiddleware(),
    getMiddlewareMiddleware(context),
    getApiMiddleware(context),
    getPageMiddleware(context)
  ].filter(Boolean);
};

export const getMiddlewaresBeforeDevMiddlewares = (
  devMiddleware: DevMiddleware,
  context: IServerPluginContext
): IServerMiddleware => {
  onDemandRouteManager = new OnDemandRouteManager(context);
  onDemandRouteManager.devMiddleware = devMiddleware;
  return onDemandRouteManager.getServerMiddleware();
};
