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
import { renderDocument } from "@shuvi/runtime-react/lib/renderer";
import Document from "@shuvi/runtime-react/lib/source/document";
import Express from "express";
import FsRouterService from "./services/fsRouterService";
import { getClientEntries } from "./helpers/getEntries";
import { getBuildPath } from "./helpers/paths";
import { getWebpackConfig } from "./getWebpackConfig";
import {
  ENTRY_CLIENT_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN_PATH,
  ResourceType
} from "./constants";
import Server from "./server";

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
    const clientConfig = getWebpackConfig(this._app, { node: false });
    clientConfig.name = "client";
    clientConfig.entry = getClientEntries(this._app);
    console.log("client webpack config:");
    console.dir(clientConfig, { depth: null });

    const { useTypeScript } = getProjectInfo(this._paths.projectDir);
    // const serverConfig = getWebpackConfig(this._app, { node: true });
    const compiler = webpack([clientConfig]);
    const server = new Server(compiler, {
      port: 4000,
      host: "0.0.0.0"
    });
    server.watchCompiler(compiler.compilers[0], {
      useTypeScript,
      log: console.log.bind(console)
    });
    // server.watchCompiler(compiler.compilers[1], {
    //   useTypeScript: false,
    //   log() {
    //     // noop
    //   }
    // });

    server.use(this._handlePage.bind(this));

    await this._app.buildResources();
    server.start();
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
    if (req.method.toLowerCase() !== "get") {
      return next();
    }

    const tags = this._getDocumentTags();
    console.log("tags", tags);
    const html = renderDocument(Document, {
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
    const { entrypoints } = require(getBuildPath(
      this._paths.buildDir,
      BUILD_MANIFEST_PATH
    ));

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
