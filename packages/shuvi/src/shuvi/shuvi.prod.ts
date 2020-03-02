import path from "path";
import Shuvi, { EnhancedIncomingMessage } from "./shuvi";
import { serveStatic } from "../helpers/serveStatic";
import { ShuviConfig } from "../config";
import { getApp } from "../app";
import { BUILD_CLIENT_DIR } from "../constants";
import { NextFunction, ServerResponse, IncomingMessage } from "../server";

export default class ShuviProd extends Shuvi {
  constructor({ config }: { config: ShuviConfig }) {
    super(getApp(config));

    this._use(this._assetsMiddleware.bind(this));
    this._use(this._handlePageRequest.bind(this));
  }

  async ready() {
    // do nothing
  }

  private async _assetsMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction
  ) {
    const parsedUrl = (req as EnhancedIncomingMessage).parsedUrl;
    if (!(req.method === "GET" || req.method === "HEAD")) {
      return next();
    }

    if (
      !parsedUrl.pathname?.startsWith(this._app.assetPublicPath + "static/")
    ) {
      return next();
    }

    const assetPath = parsedUrl.pathname.slice(
      this._app.assetPublicPath.length
    );
    const asestAbsPath = path.join(
      this._app.paths.buildDir,
      BUILD_CLIENT_DIR,
      assetPath
    );

    try {
      await serveStatic(req, res, asestAbsPath);
    } catch (err) {
      if (err.code === "ENOENT" || err.statusCode === 404) {
        this.handle404(req, res);
      } else if (err.statusCode === 412) {
        res.statusCode = 412;
        return res.end();
      } else {
        throw err;
      }
    }
  }
}
