import { parse as parseUrl } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { createApp } from "@shuvi/core";
import { AppCore, AppConfig, RouteComponent } from "@shuvi/types/core";
import * as Runtime from "@shuvi/types/Runtime";
import { ModuleManifest } from "@shuvi/types/build";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import Express from "express";
import { htmlEscapeJsonString } from "./helpers/htmlescape";
import DevServer from "./dev/devServer";
import { RouterService as IRouterService } from "./types/routeService";
import {
  BUILD_CLIENT_RUNTIME_MAIN,
  CLIENT_CONTAINER_ID,
  CLIENT_APPDATA_ID,
  PAGE_STATIC_REGEXP,
  WEBPACK_CONFIG_CLIENT,
  WEBPACK_CONFIG_SERVER
} from "./constants";
import RouterService from "./routerService";
import { getWebpackManager } from "./webpack/webpackManager";
import { ModuleLoader } from "./webpack/output";
import { OnDemandRouteManager } from "./onDemandRouteManager";
import { runtime } from "./runtime";
import { acceptsHtml, dedupe } from "./utils";

import AppData = Runtime.AppData;

export default class Service {
  private _app: AppCore;
  private _webpackDistModuleLoader: ModuleLoader;
  private _routerService: IRouterService;
  private _onDemandRouteMgr: OnDemandRouteManager;
  private _devServer: DevServer | null;

  constructor({ config }: { config: AppConfig }) {
    this._app = createApp({
      config
    });
    this._routerService = new RouterService(this._app.paths.pagesDir);
    this._webpackDistModuleLoader = new ModuleLoader({
      buildDir: this._app.paths.buildDir
    });
    this._onDemandRouteMgr = new OnDemandRouteManager({ app: this._app });
    this._devServer = null;
  }

  async start() {
    await this._setupApp();
    await this._app.build({});

    const webpackMgr = getWebpackManager(this._app);
    const server = (this._devServer = new DevServer(webpackMgr.getCompiler(), {
      port: 4000,
      host: "0.0.0.0",
      publicPath: this._config.publicUrl
    }));
    this._onDemandRouteMgr.devServer = this._devServer;

    const { useTypeScript } = getProjectInfo(this._paths.projectDir);
    let count = 0;
    const onFirstSuccess = () => {
      if (++count >= 2) {
        console.log(`app in running on: http://localhost:4000`);
      }
    };
    server.watchCompiler(webpackMgr.getSubCompiler(WEBPACK_CONFIG_CLIENT)!, {
      useTypeScript,
      log: console.log.bind(console),
      onFirstSuccess
    });
    server.watchCompiler(webpackMgr.getSubCompiler(WEBPACK_CONFIG_SERVER)!, {
      useTypeScript: false,
      log: console.log.bind(console),
      onFirstSuccess
    });

    server.before(this._onDemandRouteMiddleware.bind(this));
    server.use(this._pageMiddleware.bind(this));

    server.start();
  }

  private async _setupApp() {
    // core files
    const app = this._app;
    app.setBootstrapModule(runtime.getBootstrapFilePath());
    app.setAppModule([app.resolveSrcFile("app.js")], runtime.getAppFilePath());
    app.setDocumentModule(
      [app.resolveSrcFile("document.js")],
      runtime.getDocumentFilePath()
    );
    this._onDemandRouteMgr.run(this._routerService);

    // runtime files
    await runtime.install(this._app);
  }

  private get _paths() {
    return this._app.paths;
  }

  private get _config() {
    return this._app.config;
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
      await this._renderPage(req, res);
    } catch (error) {
      console.warn("render fail");
      console.error(error);
    }

    next();
  }

  private async _renderPage(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const parsedUrl = parseUrl(req.url!, true);
    const context: {
      loadableModules: string[];
    } = {
      loadableModules: []
    };

    const pathname = parsedUrl.pathname! || "/";
    const { App, routes } = this._webpackDistModuleLoader.requireApp();

    // prepre render after App module loaded
    await runtime.prepareRenderApp();

    const routeProps: { [x: string]: any } = {};
    const matchedRoutes = runtime.matchRoutes(routes, pathname);
    const pendingDataFetchs: Array<() => Promise<void>> = [];
    for (let index = 0; index < matchedRoutes.length; index++) {
      const { route } = matchedRoutes[index];
      const comp = route.component as
        | RouteComponent<React.Component, any>
        | undefined;
      if (comp && comp.getInitialProps) {
        pendingDataFetchs.push(async () => {
          const props = await comp.getInitialProps!({
            pathname: pathname,
            query: parsedUrl.query,
            isServer: true,
            req,
            res
          });
          routeProps[route.id] = props || {};
        });
      }
    }

    await Promise.all(pendingDataFetchs.map(fn => fn()));

    const loadableManifest = this._webpackDistModuleLoader.getModules();
    const { appHtml } = await runtime.renderApp(App, {
      pathname,
      context,
      routeProps
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
      routeProps,
      dynamicImports,
      dynamicImportIds: [...dynamicImportIdSet]
    });
    const Document = this._webpackDistModuleLoader.requireDocument();
    const html = await runtime.renderDocument(Document.default || Document, {
      documentProps
    });

    res.end(html);
  }

  private _getDocumentProps({
    appHtml,
    dynamicImports,
    dynamicImportIds,
    routeProps
  }: {
    appHtml: string;
    routeProps: Runtime.RouteProps;
    dynamicImports: ModuleManifest[];
    dynamicImportIds: Array<string | number>;
  }): Runtime.DocumentProps {
    const styles: Runtime.HtmlTag<"link">[] = [];
    const scripts: Runtime.HtmlTag<"script">[] = [];
    const entrypoints = this._webpackDistModuleLoader.getEntryAssets(
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
      routeProps,
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
}
