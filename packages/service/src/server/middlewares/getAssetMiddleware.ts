import { IServerPluginContext } from '../plugin';
import { IRequestHandlerWithNext } from '../../server/http-server';
import { BUILD_DEFAULT_DIR } from '../../constants';
import { isStaticFileExist, serveStatic } from '../utils';

export const getAssetMiddleware = (
  cliContext: IServerPluginContext,
  isDev: boolean = false
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');

    let assetAbsPaths = [cliContext.resolveBuildFile(BUILD_DEFAULT_DIR, path)];

    if (isDev) {
      assetAbsPaths = [...assetAbsPaths, cliContext.resolvePublicFile(path)];
    }

    for (const assetAbsPath of assetAbsPaths) {
      if (!isStaticFileExist(assetAbsPath)) {
        continue;
      }
      let err = null;
      try {
        return await serveStatic(req, res, assetAbsPath);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          error.statusCode = 404;
        }
        err = error;
      }

      if (err) return next(err);
    }
    return next();
  };
};
