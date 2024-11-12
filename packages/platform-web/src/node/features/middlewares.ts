import { IServerPluginContext, IServerMiddleware } from '@shuvi/service';
import { DevMiddleware } from '@shuvi/service/lib/server/middlewares/dev/devMiddleware';

import { OnDemandRouteManager } from './on-demand-compile-page';
import { getApiMiddleware, getMiddlewareMiddleware } from './filesystem-routes';
import { getPageMiddleware } from './html-render';
import { getSetupAppConfigMiddleware } from './setup-app-config';

export const getMiddlewares = async (
  context: IServerPluginContext
): Promise<IServerMiddleware[]> => {
  return [
    getMiddlewareMiddleware(context),
    getApiMiddleware(context),
    getSetupAppConfigMiddleware(context),
    await getPageMiddleware(context)
  ].filter(Boolean);
};

export const getMiddlewaresBeforeDevMiddlewares = (
  devMiddleware: DevMiddleware,
  context: IServerPluginContext
): IServerMiddleware[] => {
  const onDemandRouteManager = new OnDemandRouteManager(context);
  onDemandRouteManager.devMiddleware = devMiddleware;

  return [
    // getSetupAppConfigMiddleware(context), // set appConfig first
    onDemandRouteManager.getServerMiddleware(), // check page-*.js
    onDemandRouteManager.ensureRoutesMiddleware() // check page request
  ];
};
