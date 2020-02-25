import { parse as parseUrl } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { RouteComponent, Runtime } from "@shuvi/core";
import { ModuleLoader } from "./compiler/output";
import { htmlEscapeJsonString } from "./helpers/htmlescape";
import { App } from "./app";
import { runtime } from "./runtime";
import {
  BUILD_CLIENT_RUNTIME_MAIN,
  DEV_STYLE_ANCHOR_ID,
  CLIENT_APPDATA_ID,
  CLIENT_CONTAINER_ID
} from "./constants";
import AppData = Runtime.AppData;

const isDev = process.env.NODE_ENV === "development";

class DocumentServiceImpl {
  private _app: App;
  private _distModuleLoader: ModuleLoader;

  constructor({ app }: { app: App }) {
    this._app = app;
    this._distModuleLoader = new ModuleLoader({
      buildDir: this._app.paths.buildDir
    });
  }

  async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const html = await this.renderDocument({ url: req.url || "/" });
    res.end(html);
  }

  async renderDocument(req: { url: string }): Promise<string> {
    let html: string;
    if (this._app.ssr) {
      html = await this._getSSRDocument(req);
    } else {
      html = await this._getDocument(req);
    }

    return html;
  }

  private async _getDocument(_req: { url: string }): Promise<string> {
    const mainAssetsTags = this._getMainAssetTags();
    return this._renderDocument({
      headTags: [...mainAssetsTags.styles],
      contentTags: [this._getDocumentContent()],
      scriptTags: [...mainAssetsTags.scripts]
    });
  }

  private async _getSSRDocument(req: { url: string }): Promise<string> {
    const parsedUrl = parseUrl(req.url, true);
    const context: {
      loadableModules: string[];
    } = {
      loadableModules: []
    };

    const pathname = parsedUrl.pathname!;
    const { App, routes } = this._distModuleLoader.requireApp();

    // prepre render after App module loaded
    await runtime.prepareRenderApp();

    const routeProps: { [x: string]: any } = {};
    const matchedRoutes = runtime.matchRoutes(routes, pathname);
    const pendingDataFetchs: Array<() => Promise<void>> = [];
    for (let index = 0; index < matchedRoutes.length; index++) {
      const { route, match } = matchedRoutes[index];
      const comp = route.component as
        | RouteComponent<React.Component, any>
        | undefined;
      if (comp && comp.getInitialProps) {
        pendingDataFetchs.push(async () => {
          const props = await comp.getInitialProps!({
            pathname: pathname,
            query: parsedUrl.query,
            params: match.params,
            isServer: true,
            req
            // res: res as any
          });
          routeProps[route.id] = props || {};
        });
      }
    }

    await Promise.all(pendingDataFetchs.map(fn => fn()));

    const loadableManifest = this._distModuleLoader.getLoadableManifest();
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

    const documentProps = this._getSSRDocumentProps({
      appHtml,
      routeProps,
      dynamicImportIds: [...dynamicImportIdSet],
      dynamicImportAssets: [...dynamicImportChunkSet]
    });
    return this._renderDocument(documentProps);
  }

  private _getSSRDocumentProps({
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
    const mainAssetsTags = this._getMainAssetTags();

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
        mainAssetsTags.styles.push({
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

    const headTags = [...preloadDynamicChunks, ...mainAssetsTags.styles];
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
      scriptTags: [inlineAppData, ...mainAssetsTags.scripts]
    };
  }

  private async _renderDocument(documentProps: Runtime.DocumentProps) {
    const Document = this._distModuleLoader.requireDocument();
    const html = await runtime.renderDocument(Document.default || Document, {
      documentProps
    });
    return html;
  }

  private _getMainAssetTags(): {
    styles: Runtime.HtmlTag<any>[];
    scripts: Runtime.HtmlTag<any>[];
  } {
    const styles: Runtime.HtmlTag<"link" | "style">[] = [];
    const scripts: Runtime.HtmlTag<"script">[] = [];
    const entrypoints = this._distModuleLoader.getEntryAssets(
      BUILD_CLIENT_RUNTIME_MAIN
    );
    entrypoints.js.forEach((asset: string) => {
      scripts.push({
        tagName: "script",
        attrs: {
          src: this._app.getPublicUrlPath(asset)
        }
      });
    });
    if (entrypoints.css) {
      entrypoints.css.forEach((asset: string) => {
        styles.push({
          tagName: "link",
          attrs: {
            rel: "stylesheet",
            href: this._app.getPublicUrlPath(asset)
          }
        });
      });
    }

    return {
      styles,
      scripts
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

  private _getDocumentContent(html: string = ""): Runtime.HtmlTag<"div"> {
    return {
      tagName: "div",
      attrs: {
        id: CLIENT_CONTAINER_ID,
        innerHtml: html
      }
    };
  }
}

export type DocumentService = InstanceType<typeof DocumentServiceImpl>;

export function getDocumentService({ app }: { app: App }): DocumentServiceImpl {
  return new DocumentServiceImpl({ app });
}
