import FeatureOnDemanCompilePage from './on-demand-compile-page';
import FeatureAPIMiddleware from './api-middleware';
import FeaturePageMiddleware from './page-middleware';
import FeatureHTMLRender from './html-render';

export { buildHtml } from './main/buildHtml';

export { getMiddlewares, getMiddlewaresBeforeDevMiddlewares } from './middlewares'

export { getPlugin as getMainPlugin } from './main'

export const featurePlugins = [
  FeatureOnDemanCompilePage,
  FeatureAPIMiddleware,
  FeaturePageMiddleware,
  FeatureHTMLRender
];
