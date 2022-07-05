import FeatureOnDemanCompilePage from './on-demand-compile-page';
import FeatureHTMLRender from './html-render';
import FeatureCustomServer from './html-render/plugin-custom-server';
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
  FeatureCustomServer
];
