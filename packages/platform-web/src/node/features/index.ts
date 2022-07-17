import FeatureOnDemanCompilePage from './on-demand-compile-page';
import FeatureHTMLRender from './html-render';
import FeatureCustomServer from './custom-server';
import FeatureModel from './model';
import FilesystemRoutes from './filesystem-routes';
import FeatureCustomConfig from './custom-config';

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
  FeatureModel,
  FeatureCustomConfig
];
