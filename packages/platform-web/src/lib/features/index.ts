import { IServerPluginContext, IServerMiddleware } from '@shuvi/service';
import { DevMiddleware } from '@shuvi/service/lib/server/middlewares/dev/devMiddleware';

import FeatureOnDemanCompilePage, {
  OnDemandRouteManager
} from './on-demand-compile-page';
import FeatureAPIMiddleware, { getApiMiddleware } from './api-middleware';
import FeaturePageMiddleware, { getPageMiddleware } from './page-middleware';
import FeatureHTMLRender, { getSSRMiddleware } from './html-render';

export { buildHtml } from './buildHtml';

export const featurePlugins = [
  FeatureOnDemanCompilePage,
  FeatureAPIMiddleware,
  FeaturePageMiddleware,
  FeatureHTMLRender
];

let onDemandRouteManager: OnDemandRouteManager;

export const getMiddlewares = (
  context: IServerPluginContext
): IServerMiddleware[] => {
  const middlewaresFromPlugin = context.serverPluginRunner
    .addMiddleware()
    .flat();
  return [
    ...middlewaresFromPlugin,
    onDemandRouteManager && onDemandRouteManager.ensureRoutesMiddleware(),
    getApiMiddleware(context),
    getPageMiddleware(context),
    getSSRMiddleware(context)
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
