import { createPlugin } from '@shuvi/service';
import { getRoutesFromFiles } from '@shuvi/service/lib/route';
import { getRoutesContent, getRoutesContentFromRawRoutes } from './lib';

export { IApiRequestHandler } from './lib/apiRouteHandler';

export default createPlugin({
  addServerPlugin: () => [require.resolve('./server')],
  addRuntimeFile: ({ createFile, getAllFiles }, context) => {
    const {
      config: { apiRoutes, apiConfig },
      paths
    } = context;
    const { prefix } = apiConfig;
    const apiRoutesFile =
      Array.isArray(apiRoutes) && apiRoutes.length
        ? createFile({
            name: 'apiRoutes.js',
            content: () => getRoutesContent(apiRoutes, paths.apisDir, prefix)
          })
        : createFile({
            name: 'apiRoutes.js',
            content: () => {
              const rawRoutes = getRoutesFromFiles(
                getAllFiles(paths.apisDir),
                paths.apisDir,
                true
              );
              return getRoutesContentFromRawRoutes(
                rawRoutes,
                paths.apisDir,
                prefix
              );
            },
            dependencies: paths.apisDir
          });
    return [apiRoutesFile];
  }
});
