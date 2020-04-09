import { UrlWithParsedQuery } from "url";
import { Runtime, IRuntimeConfig } from "@shuvi/types";
import { htmlEscapeJsonString } from "@shuvi/utils/lib/htmlescape";
import getRuntimeConfig from "../lib/runtimeConfig";
import { CLIENT_APPDATA_ID } from "../constants";
import { BaseRenderer } from "./base";
import { tag } from "./htmlTag";
import { IServerContext } from "./types";

import IAppData = Runtime.IAppData;
import IHtmlTag = Runtime.IHtmlTag;

export class SsrRenderer extends BaseRenderer {
  constructor(ctx: IServerContext) {
    super(ctx);
  }

  async getDocumentProps(req: { url: UrlWithParsedQuery }) {
    const { api } = this._serverCtx;
    const { renderer } = api.resources.server;
    const {
      app: { App },
      routes
    } = api.resources.server;
    const result = await renderer({
      api,
      req,
      App,
      routes,
      manifest: api.resources.clientManifest
    });
    if (result.redirect) {
      return {
        $type: "redirect",
        ...result.redirect
      } as const;
    }

    const mainAssetsTags = this._getMainAssetTags();
    const documentProps = {
      htmlAttrs: { ...result.htmlAttrs },
      headTags: [
        ...(result.headBeginTags || []),
        ...mainAssetsTags.styles,
        ...(result.headEndTags || [])
      ],
      mainTags: [
        ...(result.mainBeginTags || []),
        this._getAppContainerTag(result.appHtml),
        ...(result.mainEndTags || [])
      ],
      scriptTags: [
        ...(result.scriptBeginTags || []),
        // TODO: add appdata hook
        this._getInlineAppData({
          runtimeConfig: this._getPublicRuntimeConfig(),
          ssr: api.config.ssr,
          ...result.appData
        }),
        ...mainAssetsTags.scripts,
        ...(result.scriptEndTags || [])
      ]
    };
    return documentProps;
  }

  private _getInlineAppData(appData: IAppData): IHtmlTag<"script"> {
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

  private _getPublicRuntimeConfig(): IRuntimeConfig {
    const runtimeConfig = getRuntimeConfig() || {};
    const keys = Object.keys(runtimeConfig);
    const res: IRuntimeConfig = {};
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (key.startsWith("$")) continue;

      res[key] = runtimeConfig[key];
    }
    return res;
  }
}
