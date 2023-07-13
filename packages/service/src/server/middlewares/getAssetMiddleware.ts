import { SERVER_REQUEST } from '@shuvi/shared/constants/trace';
import { IServerPluginContext } from '../plugin';
import { ShuviRequestHandler } from '../../server';
import { CLIENT_OUTPUT_DIR } from '../../constants';
import { isStaticFileExist, serveStatic } from '../utils';

const { SHUVI_SERVER_HANDLE_REQUEST_START, SHUVI_SERVER_RUN_ASSET_MIDDLEWARE } =
  SERVER_REQUEST.events;

export const getAssetMiddleware = (
  context: IServerPluginContext
): ShuviRequestHandler => {
  return async (req, res, next) => {
    const { serverRequestTrace } = context.traces;
    serverRequestTrace
      .traceChild(SHUVI_SERVER_HANDLE_REQUEST_START.name)
      .stop();
    const candidatePaths = [];

    try {
      const fullUrl = new URL(req.url, `http://${req.headers.host}`);
      let assetPath: string = fullUrl.pathname;

      if (context.assetPublicPath.startsWith('/')) {
        assetPath = assetPath.replace(context.assetPublicPath, '');
        candidatePaths.push(
          context.resolveBuildFile(CLIENT_OUTPUT_DIR, assetPath)
        );
      } else {
        fullUrl.search = '';
        const urlWithoutQuery = fullUrl.toString();
        // when assetPublicPath is http:localhost:3000/xx
        if (urlWithoutQuery.startsWith(context.assetPublicPath)) {
          assetPath = urlWithoutQuery.replace(context.assetPublicPath, '');
          candidatePaths.push(
            context.resolveBuildFile(CLIENT_OUTPUT_DIR, assetPath)
          );
        }
      }

      candidatePaths.push(context.resolvePublicFile(assetPath));
    } catch (err) {
      return next(err);
    }
    if (!candidatePaths.length) {
      return next();
    }

    for (const assetAbsPath of candidatePaths) {
      if (!isStaticFileExist(assetAbsPath)) {
        continue;
      }
      const runAssetMiddlewareTrace = serverRequestTrace.traceChild(
        SHUVI_SERVER_RUN_ASSET_MIDDLEWARE.name
      );

      let err = null;
      try {
        await serveStatic(req, res, assetAbsPath);
        runAssetMiddlewareTrace.setAttributes({
          [SHUVI_SERVER_RUN_ASSET_MIDDLEWARE.attrs.error.name]: false,
          [SHUVI_SERVER_RUN_ASSET_MIDDLEWARE.attrs.statusCode.name]:
            res.statusCode
        });
        runAssetMiddlewareTrace.stop();
        return;
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          error.statusCode = 404;
        }
        err = error;
      }

      if (err) {
        runAssetMiddlewareTrace.setAttributes({
          [SHUVI_SERVER_RUN_ASSET_MIDDLEWARE.attrs.error.name]: true,
          [SHUVI_SERVER_RUN_ASSET_MIDDLEWARE.attrs.statusCode.name]:
            err?.statusCode || res.statusCode
        });
        runAssetMiddlewareTrace.stop();
        return next(err);
      }
    }

    next();
  };
};
