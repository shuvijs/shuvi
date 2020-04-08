import { Runtime, ITemplateData } from "@shuvi/types";
import { parse as parseUrl, UrlWithParsedQuery } from "url";
import {
  CLIENT_CONTAINER_ID,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_POLYFILL,
  DEV_STYLE_ANCHOR_ID
} from "../constants";
import { renderTemplate } from "../lib/viewTemplate";
import { tag, stringifyTag, stringifyAttrs } from "./htmlTag";
import { IServerContext } from "./types";
import { IBuiltResource } from "../api";

import IHtmlTag = Runtime.IHtmlTag;
import IDocumentProps = Runtime.IDocumentProps;
import IRenderResultRedirect = Runtime.IRenderResultRedirect;

export function isRedirect(obj: any): obj is IRenderResultRedirect {
  return obj && (obj as IRenderResultRedirect).$type === "redirect";
}

export abstract class BaseRenderer {
  protected _serverCtx: IServerContext;
  protected _resources: IBuiltResource;

  constructor(serverContext: IServerContext) {
    this._serverCtx = serverContext;
    this._resources = serverContext.api.resources;
  }

  async renderDocument(req: {
    url?: string;
    parsedUrl?: UrlWithParsedQuery;
  }): Promise<string | IRenderResultRedirect> {
    let { parsedUrl } = req;
    if (!parsedUrl) {
      parsedUrl = parseUrl(req.url || "", true);
    }
    const { document } = this._resources.server;

    const docProps = await this.getDocumentProps({ url: parsedUrl });
    if (isRedirect(docProps)) {
      return docProps;
    }

    if (document.onDocumentProps) {
      document.onDocumentProps(docProps);
    }
    return this._renderDocument(
      docProps,
      document.getTemplateData ? document.getTemplateData() : {}
    );
  }

  protected abstract getDocumentProps(req: {
    url: UrlWithParsedQuery;
  }):
    | Promise<IDocumentProps | IRenderResultRedirect>
    | IDocumentProps
    | IRenderResultRedirect;

  protected _getMainAssetTags(): {
    styles: IHtmlTag<any>[];
    scripts: IHtmlTag<any>[];
  } {
    const styles: IHtmlTag<"link" | "style">[] = [];
    const scripts: IHtmlTag<"script">[] = [];
    const { clientManifest } = this._serverCtx.api.resources;
    const entrypoints = clientManifest.entries[BUILD_CLIENT_RUNTIME_MAIN];
    const polyfill = clientManifest.chunks[BUILD_CLIENT_RUNTIME_POLYFILL];
    scripts.push(
      tag("script", {
        src: this._serverCtx.api.getAssetPublicUrl(polyfill)
      })
    );
    entrypoints.js.forEach((asset: string) => {
      scripts.push(
        tag("script", {
          src: this._serverCtx.api.getAssetPublicUrl(asset)
        })
      );
    });
    if (entrypoints.css) {
      entrypoints.css.forEach((asset: string) => {
        styles.push(
          tag("link", {
            rel: "stylesheet",
            href: this._serverCtx.api.getAssetPublicUrl(asset)
          })
        );
      });
    }
    if (this._serverCtx.api.mode === "development") {
      styles.push(
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
      styles,
      scripts
    };
  }

  protected _getAppContainerTag(html: string = ""): IHtmlTag<"div"> {
    return tag(
      "div",
      {
        id: CLIENT_CONTAINER_ID
      },
      html
    );
  }

  private _renderDocument(
    documentProps: IDocumentProps,
    templateData: ITemplateData = {}
  ) {
    const htmlAttrs = stringifyAttrs(documentProps.htmlAttrs);
    const head = documentProps.headTags.map(tag => stringifyTag(tag)).join("");
    const main = documentProps.mainTags.map(tag => stringifyTag(tag)).join("");
    const script = documentProps.scriptTags
      .map(tag => stringifyTag(tag))
      .join("");

    return renderTemplate(this._serverCtx.api.resources.documentTemplate, {
      htmlAttrs,
      head,
      main,
      script,
      ...templateData
    });
  }
}
