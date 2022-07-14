import FeatureOnDemanCompilePage from './on-demand-compile-page';
import FeatureHTMLRender from './html-render';
import FeatureCustomServer from './custom-server';
import FeatyreModel from './model';
import FilesystemRoutes from './filesystem-routes';

export { buildHtml } from './main/buildHtml';

export {
  getMiddlewares,
  getMiddlewaresBeforeDevMiddlewares
} from './middlewares';

export { getPlugin as getMainPlugin } from './main';

export const featurePlugins = [
  FeatureOnDemanCompilePage,
  FilesystemRoutes,
  FeatureHTMLRender,
  FeatureCustomServer,
  FeatyreModel
];
