import { IServerPluginContext } from '../plugin';
import { IRequestHandlerWithNext } from '../../server/http-server';
import { BUILD_DEFAULT_DIR } from '../../constants';
import { isStaticFileExist, serveStatic } from '../utils';

export const getAssetMiddleware = (
  context: IServerPluginContext,
  isDev: boolean = false
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    const candidatePaths = [];

    if (context.assetPublicPath.startsWith('/')) {
      path = path.replace(context.assetPublicPath, '');
      candidatePaths.push(context.resolveBuildFile(BUILD_DEFAULT_DIR, path));
    }

    if (isDev) {
      candidatePaths.push(context.resolvePublicFile(path));
    }

    if (!candidatePaths.length) {
      return next();
    }

    for (const assetAbsPath of candidatePaths) {
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

      if (err) {
        return next(err);
      }
    }

    next();
  };
};
