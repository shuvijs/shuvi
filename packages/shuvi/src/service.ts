import webpack from "webpack";
import { app } from "@shuvi/core";
import { AppCore, AppConfig } from "@shuvi/types/core";
import * as Runtime from "@shuvi/types/Runtime";
import { ModuleManifest } from "@shuvi/types/build";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import ReactRuntime from "@shuvi/runtime-react";
import Express from "express";
import FsRouterService from "./services/fsRouterService";
import { getClientEntries } from "./helpers/getWebpackEntries";
import { getWebpackConfig } from "./helpers/getWebpackConfig";
import BuildRequier from "./helpers/BuildRequier";
import { htmlEscapeJsonString } from "./helpers/htmlescape";
import {
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_SERVER_DOCUMENT,
  BUILD_SERVER_APP,
  CLIENT_CONTAINER_ID,
  CLIENT_APPDATA_ID
} from "./constants";
import Server from "./server";
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

  constructor({ config }: { config: Partial<AppConfig> }) {
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
      [app.resolveSrcFile("app.js")],
      ReactRuntime.getAppFilePath()
    );
    // app.addTemplateFile("routes.js", resolveTemplate("routes"), {
    //   routes: serializeRoutes(routeConfig.routes)
    // });
    app.addSelectorFile(
      "document.js",
      [app.resolveSrcFile("document.js")],
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

    const context: {
      loadableModules: string[];
    } = {
      loadableModules: []
    };
    const App = this._buildRequier.requireApp();
    const loadableManifest = this._buildRequier.getModules();
    let appHtml: string;
    try {
      appHtml = await ReactRuntime.renderApp(App.default || App, {
        url: req.url,
        context
      });
    } catch (error) {
      appHtml = "";
      console.error("renderApp error", error);
    }

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
    const html = await ReactRuntime.renderDocument(
      Document.default || Document,
      {
        documentProps
      }
    );

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
