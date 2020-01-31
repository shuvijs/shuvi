import path from "path";
import webpack from "webpack";
import { app, Application, ApplicationConfig, Runtime } from "@shuvi/core";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import ReactRuntime from "@shuvi/runtime-react";
import Express from "express";
import FsRouterService from "./services/fsRouterService";
import { getClientEntries } from "./helpers/getWebpackEntries";
import { getWebpackConfig } from "./helpers/getWebpackConfig";
import { resolveTemplate } from "./helpers/paths";
import BuildRequier from "./helpers/BuildRequier";
import {
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_SERVER_DOCUMENT,
  BUILD_SERVER_APP
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
  private _buildRequier: BuildRequier;

  constructor({ config }: { config: Partial<ApplicationConfig> }) {
    this._app = app({
      config: { ...defaultConfig, ...config },
      routerService: new FsRouterService()
    });
    this._buildRequier = new BuildRequier({
      buildDir: this._app.paths.buildDir
    });
  }

  async start() {
    await this._setupRuntime();

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
      [BUILD_SERVER_DOCUMENT]: ["@shuvi-app/document"],
      [BUILD_SERVER_APP]: ["@shuvi-app/app"]
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
      bootstrapFile: ReactRuntime.getBootstrapFilePath()
    });
    server.start();
  }

  private async _setupRuntime() {
    const app = this._app;
    app.addFile("bootstrap.js", {
      content: `export * from "${ReactRuntime.getBootstrapFilePath()}"`
    });
    app.addSelectorFile(
      "app.js",
      [app.getSrcPath("app.js")],
      ReactRuntime.getAppFilePath()
    );
    // app.addTemplateFile("routes.js", resolveTemplate("routes"), {
    //   routes: serializeRoutes(routeConfig.routes)
    // });
    app.addSelectorFile(
      "document.js",
      [app.getSrcPath("document.js")],
      ReactRuntime.getDocumentFilePath()
    );
    ReactRuntime.install(this._app);
  }

  private get _paths() {
    return this._app.paths;
  }

  private get _config() {
    return this._app.config;
  }

  private async _handlePage(
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
    const Document = this._buildRequier.requireDocument();
    const App = this._buildRequier.requireApp();
    const html = await ReactRuntime.renderDocument(
      req,
      res,
      Document.default || Document,
      App.default || App,
      {
        appData: {},
        documentProps: {
          appHtml: "",
          bodyTags: tags.bodyTags,
          headTags: tags.headTags
        }
      }
    );
    res.end(html);
  }

  private _getDocumentTags(): {
    bodyTags: Runtime.DocumentProps["bodyTags"];
    headTags: Runtime.DocumentProps["headTags"];
  } {
    const entrypoints = this._buildRequier.getEntryAssets(
      BUILD_CLIENT_RUNTIME_MAIN
    );
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
