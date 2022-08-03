import { IPlatformContext, ResolvedPlugin } from '@shuvi/service/lib/core';
import FeatureOnDemanCompilePage from './on-demand-compile-page';
import { getPlugin as getHTMLRenderPlugin } from './html-render';
import FeatureCustomServer from './custom-server';
import FeatureModel from './model';
import FilesystemRoutes from './filesystem-routes';

export { buildHtml } from './html-render/lib/buildHtml';

export {
  getMiddlewares,
  getMiddlewaresBeforeDevMiddlewares
} from './middlewares';

export const getPlugins = (
  platformContext: IPlatformContext
): ResolvedPlugin[] => [
  getHTMLRenderPlugin(platformContext),
  FeatureOnDemanCompilePage,
  FilesystemRoutes,
  FeatureCustomServer,
  FeatureModel
];
