import { parse as parseUrl } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { AppConfig, RouteComponent } from "@shuvi/types/core";
import * as Runtime from "@shuvi/types/Runtime";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import {
  DEV_STYLE_ANCHOR_ID,
  CLIENT_CONTAINER_ID,
  CLIENT_APPDATA_ID
} from "@shuvi/shared/lib/constants";
import Express from "express";
import { htmlEscapeJsonString } from "../helpers/htmlescape";
import DevServer from "../dev/devServer";
import {
  BUILD_CLIENT_RUNTIME_MAIN,
  PAGE_STATIC_REGEXP,
  WEBPACK_CONFIG_CLIENT,
  WEBPACK_CONFIG_SERVER
} from "../constants";
import { getCompiler } from "../compiler/compiler";
import { ModuleLoader } from "../compiler/output";
import { OnDemandRouteManager } from "../onDemandRouteManager";
import { runtime } from "../runtime";
import { acceptsHtml } from "../utils";
import { App, getApp } from "../app";

import AppData = Runtime.AppData;

const isDev = process.env.NODE_ENV === "development";

export default class Service {
  private _config: AppConfig;
  private _app: App;
  private _webpackDistModuleLoader: ModuleLoader;
  private _onDemandRouteMgr: OnDemandRouteManager;
  private _devServer: DevServer | null;

  constructor({ config }: { config: AppConfig }) {
    this._config = config;
    this._app = getApp(config);
    this._webpackDistModuleLoader = new ModuleLoader({
      buildDir: this._app.paths.buildDir
    });
    this._onDemandRouteMgr = new OnDemandRouteManager({ app: this._app });
    this._devServer = null;
  }

  async start() {
    await this._app.watch();

    const compiler = getCompiler(this._app);
    const server = (this._devServer = new DevServer(compiler.getWebpackCompiler(), {
      port: 4000,
      host: "0.0.0.0",
      publicPath: this._config.publicUrl
    }));
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
      await this.renderPage(req, res);
    } catch (error) {
      console.warn("render fail");
      console.error(error);
    }

    next();
  }

  async renderPage(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

    const loadableManifest = this._webpackDistModuleLoader.getLoadableManifest();
    const { appHtml } = await runtime.renderApp(App, {
      pathname,
      context,
      routeProps
    });
    const dynamicImportIdSet = new Set<string>();
    const dynamicImportChunkSet = new Set<string>();
    for (const mod of context.loadableModules) {
      const manifestItem = loadableManifest[mod];
      if (manifestItem) {
        manifestItem.files.forEach(file => {
          dynamicImportChunkSet.add(file);
        });
        manifestItem.children.forEach(item => {
          dynamicImportIdSet.add(item.id as string);
        });
      }
    }

    const documentProps = this._getDocumentProps({
      appHtml,
      routeProps,
      dynamicImportIds: [...dynamicImportIdSet],
      dynamicImportAssets: [...dynamicImportChunkSet]
    });
    const Document = this._webpackDistModuleLoader.requireDocument();
    const html = await runtime.renderDocument(Document.default || Document, {
      documentProps
    });

    res.end(html);
  }

  private _getDocumentProps({
    appHtml,
    routeProps,
    dynamicImportIds,
    dynamicImportAssets
  }: {
    appHtml: string;
    routeProps: Runtime.RouteProps;
    dynamicImportIds: Array<string | number>;
    dynamicImportAssets: string[];
  }): Runtime.DocumentProps {
    const mainStyles: Runtime.HtmlTag<"link" | "style">[] = [];
    const mainScripts: Runtime.HtmlTag<"script">[] = [];
    const entrypoints = this._webpackDistModuleLoader.getEntryAssets(
      BUILD_CLIENT_RUNTIME_MAIN
    );
    entrypoints.js.forEach((asset: string) => {
      mainScripts.push({
        tagName: "script",
        attrs: {
          src: this._app.getPublicUrlPath(asset)
        }
      });
    });
    if (entrypoints.css) {
      entrypoints.css.forEach((asset: string) => {
        mainStyles.push({
          tagName: "link",
          attrs: {
            rel: "stylesheet",
            href: this._app.getPublicUrlPath(asset)
          }
        });
      });
    }

    const preloadDynamicChunks: Runtime.HtmlTag<"link">[] = [];

    for (const file of dynamicImportAssets) {
      if (/\.js$/.test(file)) {
        preloadDynamicChunks.push({
          tagName: "link",
          attrs: {
            rel: "preload",
            href: this._app.getPublicUrlPath(file),
            as: "script"
          }
        });
      } else if (/\.css$/.test(file)) {
        mainStyles.push({
          tagName: "link",
          attrs: {
            rel: "stylesheet",
            href: this._app.getPublicUrlPath(file)
          }
        });
      }
    }

    const inlineAppData = this._getDocumentInlineAppData({
      routeProps,
      dynamicIds: dynamicImportIds
    });

    const headTags = [...preloadDynamicChunks, ...mainStyles];
    if (isDev) {
      headTags.push(
        {
          tagName: "style",
          attrs: {
            innerHtml: "body{display:none}"
          }
        },
        /**
         * this element is used to mount development styles so the
         * ordering matches production
         * (by default, style-loader injects at the bottom of <head />)
         */
        {
          tagName: "style",
          attrs: {
            id: DEV_STYLE_ANCHOR_ID
          }
        }
      );
    }

    return {
      headTags,
      contentTags: [this._getDocumentContent(appHtml)],
      scriptTags: [inlineAppData, ...mainScripts]
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
