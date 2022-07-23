import { IServerPluginContext } from '../plugin';
import { IRequestHandlerWithNext } from '../../server/http-server';
import { BUILD_DEFAULT_DIR } from '../../constants';
import { isStaticFileExist, serveStatic } from '../utils';

export const getAssetMiddleware = (
  cliContext: IServerPluginContext,
  isDevPublic: boolean = false
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = isDevPublic
      ? cliContext.resolvePublicFile(path)
      : cliContext.resolveBuildFile(BUILD_DEFAULT_DIR, path);

    if (!isStaticFileExist(assetAbsPath)) return next();

    let err = null;
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      err = error;
    }

    if (err) next(err);
  };
};
