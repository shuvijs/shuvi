import { UrlWithParsedQuery } from "url";
import { Runtime } from "@shuvi/types";
import { htmlEscapeJsonString } from "../helpers/htmlescape";
import { runtime } from "../runtime";
import { BaseRenderer, DocumentProps } from "./base";
import { tag, HtmlTag } from "./htmlTag";
import { CLIENT_APPDATA_ID, DEV_STYLE_ANCHOR_ID } from "../constants";
import { ServerContext } from "./types";

import RouteComponent = Runtime.RouteComponent;
import AppData = Runtime.AppData;

export class SsrRenderer extends BaseRenderer {
  constructor(ctx: ServerContext) {
    super(ctx);
  }

  async getDocumentProps(req: { url: UrlWithParsedQuery }) {
    const parsedUrl = req.url;
    const context: {
      loadableModules: string[];
    } = {
      loadableModules: []
    };

    const pathname = parsedUrl.pathname!;
    const { App, routes } = this._serverCtx.app.resources.app;

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
            req: {
              url: parsedUrl.href!
            }
            // res: res as any
          });
          routeProps[route.id] = props || {};
        });
      }
    }

    await Promise.all(pendingDataFetchs.map(fn => fn()));

    const { loadble } = this._serverCtx.app.resources.clientManifest;
    const { appHtml } = await runtime.renderApp(App, {
      pathname,
      context,
      routeProps
    });
    const dynamicImportIdSet = new Set<string>();
    const dynamicImportChunkSet = new Set<string>();
    for (const mod of context.loadableModules) {
      const manifestItem = loadble[mod];
      if (manifestItem) {
        manifestItem.files.forEach(file => {
          dynamicImportChunkSet.add(file);
        });
        manifestItem.children.forEach(item => {
          dynamicImportIdSet.add(item.id as string);
        });
      }
    }

    return this._getSSRDocumentProps({
      appHtml,
      routeProps,
      dynamicImportIds: [...dynamicImportIdSet],
      dynamicImportAssets: [...dynamicImportChunkSet]
    });
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
  }): DocumentProps {
    const mainAssetsTags = this._getMainAssetTags();

    const preloadDynamicChunks: HtmlTag<"link">[] = [];
    for (const file of dynamicImportAssets) {
      if (/\.js$/.test(file)) {
        preloadDynamicChunks.push(
          tag("link", {
            rel: "preload",
            href: this._serverCtx.app.getAssetPublicUrl(file),
            as: "script"
          })
        );
      } else if (/\.css$/.test(file)) {
        mainAssetsTags.styles.push(
          tag("link", {
            rel: "stylesheet",
            href: this._serverCtx.app.getAssetPublicUrl(file)
          })
        );
      }
    }
    const inlineAppData = this._getInlineAppData({
      routeProps,
      dynamicIds: dynamicImportIds
    });

    const headTags = [...preloadDynamicChunks, ...mainAssetsTags.styles];
    if (this._serverCtx.app.dev) {
      headTags.push(
        tag("style", {}, "body{display:none}"),

        /**
         * this element is used to mount development styles so the
         * ordering matches production
         * (by default, style-loader injects at the bottom of <head />)
         */
        tag("style", {
          id: DEV_STYLE_ANCHOR_ID
        })
      );
    }

    return {
      headTags,
      mainTags: [this._getAppContainTag(appHtml)],
      scriptTags: [inlineAppData, ...mainAssetsTags.scripts]
    };
  }

  private _getInlineAppData(appData: AppData): HtmlTag<"script"> {
    const data = JSON.stringify(appData);
    return tag(
      "script",
      {
        id: CLIENT_APPDATA_ID,
        type: "application/json"
      },
      htmlEscapeJsonString(data)
    );
  }
}
