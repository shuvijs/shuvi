import { IServerPluginContext } from '../plugin';
import { ShuviRequestHandler } from '../../server';
import { BUILD_DEFAULT_DIR } from '../../constants';
import { isStaticFileExist, serveStatic } from '../utils';

export const getAssetMiddleware = (
  context: IServerPluginContext,
  isDev: boolean = false
): ShuviRequestHandler => {
  return async (req, res, next) => {
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);
    let assetPath: string = fullUrl.pathname;
    const candidatePaths = [];

    if (context.assetPublicPath.startsWith('/')) {
      assetPath = assetPath.replace(context.assetPublicPath, '');
      candidatePaths.push(
        context.resolveBuildFile(BUILD_DEFAULT_DIR, assetPath)
      );
    } else {
      fullUrl.search = '';
      const urlWithoutQuery = fullUrl.toString();
      // when assetPublicPath is http:localhost:3000/xx
      if (urlWithoutQuery.startsWith(context.assetPublicPath)) {
        assetPath = urlWithoutQuery.replace(context.assetPublicPath, '');
        candidatePaths.push(
          context.resolveBuildFile(BUILD_DEFAULT_DIR, assetPath)
        );
      }
    }

    if (isDev) {
      candidatePaths.push(context.resolvePublicFile(assetPath));
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
