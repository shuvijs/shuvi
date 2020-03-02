import { IncomingMessage, ServerResponse } from "http";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import { DevMiddleware } from "../devMiddleware";
import { NextFunction } from "../server";
import {
  DEV_PAGE_STATIC_REGEXP,
  WEBPACK_CONFIG_CLIENT,
  WEBPACK_CONFIG_SERVER
} from "../constants";
import { getCompiler } from "../compiler/compiler";
import { OnDemandRouteManager } from "../onDemandRouteManager";
import { acceptsHtml } from "../utils";
import { getApp } from "../app";
import { ShuviConfig } from "../config";
import Shuvi from "./shuvi";

export default class ShuviDev extends Shuvi {
  private _onDemandRouteMgr: OnDemandRouteManager;

  constructor({ config }: { config: ShuviConfig }) {
    super(getApp(config, { dev: true }));
    this._onDemandRouteMgr = new OnDemandRouteManager();
  }

  async ready() {
    this._onDemandRouteMgr.listen(this._app);
    await this._app.watch();

    const compiler = getCompiler(this._app);
    const devMiddleware = DevMiddleware(compiler.getWebpackCompiler(), {
      publicPath: this._app.assetPublicPath
    });
    this._onDemandRouteMgr.devMiddleware = devMiddleware;

    const { useTypeScript } = getProjectInfo(this._app.paths.projectDir);
    let count = 0;
    const onFirstSuccess = () => {
      if (++count >= 2) {
        console.log(`app in ready`);
      }
    };
    devMiddleware.watchCompiler(
      compiler.getSubCompiler(WEBPACK_CONFIG_CLIENT)!,
      {
        useTypeScript,
        log: console.log.bind(console),
        onFirstSuccess
      }
    );
    devMiddleware.watchCompiler(
      compiler.getSubCompiler(WEBPACK_CONFIG_SERVER)!,
      {
        useTypeScript: false,
        log: console.log.bind(console),
        onFirstSuccess
      }
    );

    this._use(this._onDemandRouteMiddleware.bind(this));
    this._use(devMiddleware);
    this._use(this._pageMiddleware.bind(this));
  }

  private async _onDemandRouteMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction
  ) {
    const match = req.url!.match(DEV_PAGE_STATIC_REGEXP);
    if (!match) {
      return next();
    }

    const routeId = match[1];
    await this._onDemandRouteMgr.activateRoute(routeId);
    next();
  }

  private async _pageMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction
  ) {
    const headers = req.headers;
    if (req.method !== "GET") {
      return next();
    } else if (!headers || typeof headers.accept !== "string") {
      return next();
    } else if (headers.accept.indexOf("application/json") === 0) {
      return next();
    } else if (
      !acceptsHtml(headers.accept, { htmlAcceptHeaders: ["text/html"] })
    ) {
      return next();
    }

    await this._onDemandRouteMgr.ensureRoutes(req.url || "/");

    let err: Error | undefined;
    try {
      await this._handlePageRequest(req, res);
    } catch (error) {
      console.warn("render fail");
      err = error;
    }

    next(err);
  }
}
