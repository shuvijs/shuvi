import { parse as parseUrl, UrlWithParsedQuery } from "url";
import { BUILD_CLIENT_RUNTIME_MAIN } from "../constants";
import { renderTemplate } from "./view";
import { tag, stringifyTag, HtmlTag } from "./htmlTag";
import { CLIENT_CONTAINER_ID } from "../constants";
import { ServerContext } from "./types";

export type HtmlAttrs = {
  [x: string]: string | number | undefined;
};

export interface DocumentProps {
  headTags: HtmlTag<
    "meta" | "link" | "style" | "script" | "noscript" | "title"
  >[];
  mainTags: HtmlTag[];
  scriptTags: HtmlTag<"script">[];
}

export abstract class BaseRenderer {
  protected _serverCtx: ServerContext;

  constructor(serverContext: ServerContext) {
    this._serverCtx = serverContext;
  }

  async renderDocument(req: {
    url?: string;
    parsedUrl?: UrlWithParsedQuery;
  }): Promise<string> {
    let { parsedUrl } = req;
    if (!parsedUrl) {
      parsedUrl = parseUrl(req.url || "", true);
    }
    const docProps = await this.getDocumentProps({ url: parsedUrl });
    return this._renderDocument(docProps);
  }

  protected abstract getDocumentProps(req: {
    url: UrlWithParsedQuery;
  }): Promise<DocumentProps> | DocumentProps;

  protected _getMainAssetTags(): {
    styles: HtmlTag<any>[];
    scripts: HtmlTag<any>[];
  } {
    const styles: HtmlTag<"link" | "style">[] = [];
    const scripts: HtmlTag<"script">[] = [];
    const entrypoints = this._serverCtx.app.resources.clientManifest.entries[
      BUILD_CLIENT_RUNTIME_MAIN
    ];
    entrypoints.js.forEach((asset: string) => {
      scripts.push(
        tag("script", {
          src: this._serverCtx.app.getAssetPublicUrl(asset)
        })
      );
    });
    if (entrypoints.css) {
      entrypoints.css.forEach((asset: string) => {
        styles.push(
          tag("link", {
            rel: "stylesheet",
            href: this._serverCtx.app.getAssetPublicUrl(asset)
          })
        );
      });
    }

    return {
      styles,
      scripts
    };
  }

  protected _getAppContainTag(html: string = ""): HtmlTag<"div"> {
    return tag(
      "div",
      {
        id: CLIENT_CONTAINER_ID
      },
      html
    );
  }

  private _renderDocument(documentProps: DocumentProps) {
    const head = documentProps.headTags.map(tag => stringifyTag(tag)).join("");
    const main = documentProps.mainTags.map(tag => stringifyTag(tag)).join("");
    const script = documentProps.scriptTags
      .map(tag => stringifyTag(tag))
      .join("");

    return renderTemplate(this._serverCtx.app.resources.documentTemplate, {
      head,
      main,
      script
    });
  }
}
