import { createPlugin } from '@shuvi/service';
import { getRoutesFromFiles } from '@shuvi/service/lib/route';
import { getRoutesContentFromRawRoutes } from './lib';

export default createPlugin({
  addServerPlugin: () => [require.resolve('./server')],
  addRuntimeFile: ({ createFile, getAllFiles }, context) => {
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
