import path from "path";
import webpack from "webpack";
import {
  app,
  Application,
  ApplicationConfig,
  RouterService,
  Runtime
} from "@shuvi/core";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import ReactRuntime from "@shuvi/runtime-react";
import Express from "express";
import FsRouterService from "./services/fsRouterService";
import { getClientEntries } from "./helpers/getWebpackEntries";
import { waitN } from "./helpers/wait";
import { getWebpackConfig } from "./helpers/getWebpackConfig";
import {
  CLIENT_ENTRY_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_SERVER_DOCUMENT
} from "./constants";
import Server from "./server";
import { acceptsHtml } from "./utils";

const defaultConfig: ApplicationConfig = {
  cwd: process.cwd(),
  outputPath: "dist",
  publicPath: "/"
};

export default class Service {
  private _app: Application;
  private _routerService: RouterService.RouterService;

  constructor({ config }: { config: Partial<ApplicationConfig> }) {
    this._app = app({ config: { ...defaultConfig, ...config } });

    this._routerService = new FsRouterService();
  }

  async start() {
    this._setupRuntime();

    const clientConfig = getWebpackConfig(this._app, { node: false });
    clientConfig.name = "client";
    clientConfig.entry = {
      [BUILD_CLIENT_RUNTIME_MAIN]: getClientEntries(this._app)
    };
    // console.log("client webpack config:");
    // console.dir(clientConfig, { depth: null });

    const { useTypeScript } = getProjectInfo(this._paths.projectDir);
    const serverConfig = getWebpackConfig(this._app, { node: true });
    serverConfig.name = "server";
    serverConfig.entry = {
      [BUILD_SERVER_DOCUMENT]: ["@shuvi-app/document"]
    };
    console.log("server webpack config:");
    console.dir(serverConfig, { depth: null });

    const compiler = webpack([clientConfig, serverConfig]);
    const server = new Server(compiler, {
      port: 4000,
      host: "0.0.0.0",
      publicPath: this._config.publicPath
    });
    let count = 0;
    const onFirstSuccess = () => {
      if (++count >= 2) {
        console.log(`app in running on: http://localhost:4000`);
      }
    };
    server.watchCompiler(compiler.compilers[0], {
      useTypeScript,
      log: console.log.bind(console),
      onFirstSuccess
    });
    server.watchCompiler(compiler.compilers[1], {
      useTypeScript: false,
      log: console.log.bind(console),
      onFirstSuccess
    });

    server.use(this._handlePage.bind(this));

    await this._app.build({
      bootstrapSrc: ReactRuntime.getBootstrapFilePath()
    });
    server.start();
  }

  private _setupRuntime() {
    ReactRuntime.install(this._app);
    this._app.addSelectorFile(
      "document.js",
      [this._app.getSrcPath("document.js")],
      ReactRuntime.getDocumentFilePath()
    );
  }

  private get _paths() {
    return this._app.paths;
  }

  private get _config() {
    return this._app.config;
  }

  private _handlePage(
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
    } else if (!acceptsHtml(headers.accept)) {
      return next();
    }

    const tags = this._getDocumentTags();
    console.debug("tags", tags);
    const Document = require(this._app.getOutputPath(BUILD_SERVER_DOCUMENT));
    const html = ReactRuntime.renderDocument(Document.default || Document, {
      appData: {},
      documentProps: {
        appHtml: "",
        bodyTags: tags.bodyTags,
        headTags: tags.headTags
      }
    });
    res.end(html);
  }

  private _getDocumentTags(): {
    bodyTags: Runtime.DocumentProps["bodyTags"];
    headTags: Runtime.DocumentProps["headTags"];
  } {
    const assetsMap = require(this._app.getOutputPath(BUILD_MANIFEST_PATH));

    const entrypoints = assetsMap.entries[BUILD_CLIENT_RUNTIME_MAIN];
    const bodyTags: Runtime.DocumentProps["bodyTags"] = [];
    const headTags: Runtime.DocumentProps["headTags"] = [];
    entrypoints.forEach((asset: string) => {
      if (/\.js$/.test(asset)) {
        bodyTags.push({
          tagName: "script",
          attrs: {
            src: this._app.getPublicPath(asset)
          }
        });
      } else if (/\.css$/.test(asset)) {
        headTags.push({
          tagName: "link",
          attrs: {
            rel: "stylesheet",
            href: this._app.getPublicPath(asset)
          }
        });
      }
    });

    return {
      bodyTags,
      headTags
    };
  }

  private async _startServer() {}
}
