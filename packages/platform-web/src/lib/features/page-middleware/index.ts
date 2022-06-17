import { createPlugin } from '@shuvi/service';
import { getRoutesFromFiles } from '@shuvi/platform-shared/lib/node';
import { getAllFiles } from '@shuvi/service/lib/project/file-utils';
import { getRoutesContentFromRawRoutes } from './lib';

export { middleware as getPageMiddleware } from './lib/middleware';

export default createPlugin({
  addRuntimeFile: ({ createFile }, context) => {
    const {
      config: { routes },
      paths
    } = context;
    // if config.routes is defined, use config
    const hasConfigRoutes = Array.isArray(routes);
    const middlewareRoutesFile = hasConfigRoutes
      ? createFile({
          name: 'middlewareRoutes.js',
          content: () => {
            return getRoutesContentFromRawRoutes(routes, paths.pagesDir);
          }
        })
      : createFile({
          name: 'middlewareRoutes.js',
          content: () => {
            const rawRoutes = getRoutesFromFiles(
              getAllFiles(paths.pagesDir),
              paths.pagesDir
            );
            return getRoutesContentFromRawRoutes(rawRoutes, paths.pagesDir);
          },
          dependencies: paths.pagesDir
        });

    return [middlewareRoutesFile];
  }
});
