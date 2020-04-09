import { IIncomingMessage, INextFunction, IServerResponse } from "../server";
import { serveStatic } from "../lib/serveStatic";
import { BUILD_CLIENT_DIR } from "../constants";
import Base from "./shuvi.base";

export default class ShuviProd extends Base {
  async init() {
    const api = this._api;
    // prepare server
    api.server.use(this._assetsMiddleware.bind(this));
    api.server.use(this._handlePageRequest.bind(this));
  }

  protected getMode() {
    return "production" as const;
  }

  private async _assetsMiddleware(
    req: IIncomingMessage,
    res: IServerResponse,
    next: INextFunction
  ) {
    const api = this._api;
    const { assetPublicPath } = api;
    const parsedUrl = req.parsedUrl;
    if (!(req.method === "GET" || req.method === "HEAD")) {
      return next();
    }

    if (!parsedUrl.pathname?.startsWith(assetPublicPath + "static/")) {
      return next();
    }

    const assetPath = parsedUrl.pathname.slice(assetPublicPath.length);
    const asestAbsPath = api.resolveBuildFile(BUILD_CLIENT_DIR, assetPath);
    try {
      await serveStatic(req, res, asestAbsPath);
    } catch (err) {
      if (err.code === "ENOENT" || err.statusCode === 404) {
        this._handle404(req, res);
      } else if (err.statusCode === 412) {
        res.statusCode = 412;
        return res.end();
      } else {
        throw err;
      }
    }
  }
}
