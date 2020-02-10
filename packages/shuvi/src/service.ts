import { IncomingMessage, ServerResponse } from "http";
import webpack from "webpack";
import { app } from "@shuvi/core";
import { AppCore, AppConfig } from "@shuvi/types/core";
import * as Runtime from "@shuvi/types/Runtime";
import { ModuleManifest } from "@shuvi/types/build";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import Express from "express";
import { getClientEntries } from "./helpers/getWebpackEntries";
import { getWebpackConfig } from "./helpers/getWebpackConfig";
import BuildRequier from "./helpers/BuildRequier";
import { htmlEscapeJsonString } from "./helpers/htmlescape";
import Server from "./server/devServer";
import { RouterService } from "./types/routeService";
import {
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_SERVER_DOCUMENT,
  BUILD_SERVER_APP,
  CLIENT_CONTAINER_ID,
  CLIENT_APPDATA_ID
} from "./constants";
import FsRouterService from "./routerService";
import { runtime } from "./runtime";
import { acceptsHtml, dedupe } from "./utils";

import AppData = Runtime.AppData;

const defaultConfig: AppConfig = {
  cwd: process.cwd(),
  outputPath: "dist",
  publicPath: "/"
};

export default class Service {
  private _app: AppCore;
  private _buildRequier: BuildRequier;
  private _routerService: RouterService;

  constructor({ config }: { config: Partial<AppConfig> }) {
    this._app = app({
      config: { ...defaultConfig, ...config }
    });
    this._routerService = new FsRouterService(this._app.paths.pagesDir);
    this._buildRequier = new BuildRequier({
      buildDir: this._app.paths.buildDir
    });
  }

  async start() {
    await this._setupApp();

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
      bootstrapFilePath: runtime.getBootstrapFilePath()
    });
    server.start();
  }

  private async _setupApp() {
    // core files
    const app = this._app;
    app.addSelectorFile(
      "app.js",
      [app.resolveSrcFile("app.js")],
      runtime.getAppFilePath()
    );
    app.addSelectorFile(
      "document.js",
      [app.resolveSrcFile("document.js")],
      runtime.getDocumentFilePath()
    );
    const routes = await this._routerService.getRoutes();
    this._app.setRoutesSource(runtime.generateRoutesSource(routes));

    // runtime files
    await runtime.install(this._app);
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
    } else if (
      !acceptsHtml(headers.accept, { htmlAcceptHeaders: ["text/html"] })
    ) {
      return next();
    }

    try {
      await this._renderPage(req, res);
    } catch (error) {
      console.warn("render fail");
      console.error(error);
    }
  }

  private async _renderPage(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const context: {
      loadableModules: string[];
    } = {
      loadableModules: []
    };
    const App = this._buildRequier.requireApp();
    const loadableManifest = this._buildRequier.getModules();
    const appHtml = await runtime.renderApp(App.default || App, {
      url: req.url || "/",
      context
    });

    const dynamicImportIdSet = new Set<string>();
    const dynamicImports: ModuleManifest[] = [];
    for (const mod of context.loadableModules) {
      const manifestItem = loadableManifest[mod];
      if (manifestItem) {
        manifestItem.forEach(item => {
          dynamicImports.push(item);
          dynamicImportIdSet.add(item.id as string);
        });
      }
    }

    const documentProps = this._getDocumentProps({
      appHtml,
      dynamicImports,
      dynamicImportIds: [...dynamicImportIdSet]
    });
    const Document = this._buildRequier.requireDocument();
    const html = await runtime.renderDocument(Document.default || Document, {
      documentProps
    });

    res.end(html);
  }

  private _getDocumentProps({
    appHtml,
    dynamicImports,
    dynamicImportIds
  }: {
    appHtml: string;
    dynamicImports: ModuleManifest[];
    dynamicImportIds: Array<string | number>;
  }): Runtime.DocumentProps {
    const styles: Runtime.HtmlTag<"link">[] = [];
    const scripts: Runtime.HtmlTag<"script">[] = [];
    const entrypoints = this._buildRequier.getEntryAssets(
      BUILD_CLIENT_RUNTIME_MAIN
    );
    entrypoints.forEach((asset: string) => {
      if (/\.js$/.test(asset)) {
        scripts.push({
          tagName: "script",
          attrs: {
            src: this._app.getPublicUrlPath(asset)
          }
        });
      } else if (/\.css$/.test(asset)) {
        styles.push({
          tagName: "link",
          attrs: {
            rel: "stylesheet",
            href: this._app.getPublicUrlPath(asset)
          }
        });
      }
    });

    const preloadDynamicChunks: Runtime.HtmlTag<"link">[] = dedupe(
      dynamicImports,
      "file"
    ).map((bundle: any) => {
      return {
        tagName: "link",
        attrs: {
          rel: "preload",
          href: this._app.getPublicUrlPath(bundle.file),
          as: "script"
        }
      };
    });

    const inlineAppData = this._getDocumentInlineAppData({
      dynamicIds: dynamicImportIds
    });

    return {
      headTags: [...styles, ...preloadDynamicChunks],
      contentTags: [this._getDocumentContent(appHtml)],
      scriptTags: [inlineAppData, ...scripts]
    };
  }

  private _getDocumentInlineAppData(
    appData: AppData
  ): Runtime.HtmlTag<"script"> {
    const data = JSON.stringify(appData);
    return {
      tagName: "script",
      attrs: {
        id: CLIENT_APPDATA_ID,
        type: "application/json",
        innerHtml: htmlEscapeJsonString(data)
      }
    };
  }

  private _getDocumentContent(html: string): Runtime.HtmlTag<"div"> {
    return {
      tagName: "div",
      attrs: {
        id: CLIENT_CONTAINER_ID,
        innerHtml: html
      }
    };
  }

  private async _startServer() {}
}
