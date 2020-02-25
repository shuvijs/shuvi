import { AppConfig } from "@shuvi/core";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import Express from "express";
import DevServer from "./devServer";
import {
  PAGE_STATIC_REGEXP,
  WEBPACK_CONFIG_CLIENT,
  WEBPACK_CONFIG_SERVER
} from "./constants";
import { getCompiler } from "./compiler/compiler";
import { OnDemandRouteManager } from "./onDemandRouteManager";
import { getDocumentService, DocumentService } from "./documentService";
import { acceptsHtml } from "./utils";
import { App, getApp } from "./app";

export default class Service {
  private _config: AppConfig;
  private _app: App;
  private _documentService: DocumentService;
  private _onDemandRouteMgr: OnDemandRouteManager;
  private _devServer: DevServer | null;

  constructor({ config }: { config: AppConfig }) {
    this._config = config;
    this._app = getApp(config);
    this._documentService = getDocumentService({ app: this._app });
    this._onDemandRouteMgr = new OnDemandRouteManager({ app: this._app });
    this._devServer = null;
  }

  async start() {
    await this._app.watch();

    const compiler = getCompiler(this._app);
    const server = (this._devServer = new DevServer(
      compiler.getWebpackCompiler(),
      {
        port: 4000,
        host: "0.0.0.0",
        publicPath: this._config.publicUrl
      }
    ));
    this._onDemandRouteMgr.devServer = this._devServer;

    const { useTypeScript } = getProjectInfo(this._app.paths.projectDir);
    let count = 0;
    const onFirstSuccess = () => {
      if (++count >= 2) {
        console.log(`app in running on: http://localhost:4000`);
      }
    };
    server.watchCompiler(compiler.getSubCompiler(WEBPACK_CONFIG_CLIENT)!, {
      useTypeScript,
      log: console.log.bind(console),
      onFirstSuccess
    });
    server.watchCompiler(compiler.getSubCompiler(WEBPACK_CONFIG_SERVER)!, {
      useTypeScript: false,
      log: console.log.bind(console),
      onFirstSuccess
    });

    server.before(this._onDemandRouteMiddleware.bind(this));
    server.use(this._pageMiddleware.bind(this));

    server.start();
  }

  private async _onDemandRouteMiddleware(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) {
    const match = req.url.match(PAGE_STATIC_REGEXP);
    if (!match) {
      return next();
    }

    const routeId = match[1];
    await this._onDemandRouteMgr.activateRoute(routeId);
    next();
  }

  private async _pageMiddleware(
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
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

    try {
      await this._documentService.handleRequest(req, res);
    } catch (error) {
      console.warn("render fail");
      console.error(error);
    }

    next();
  }
}
