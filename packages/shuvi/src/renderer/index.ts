import { UrlWithParsedQuery } from "url";
import { ServerContext } from "./types";
import { BaseRenderer } from "./base";
import { SpaRenderer } from "./spa";
import { SsrRenderer } from "./ssr";

export class Renderer {
  protected _serverCtx: ServerContext;
  private _ssrRenderer: BaseRenderer;
  private _spaRenderer: BaseRenderer;

  constructor(serverContext: ServerContext) {
    this._serverCtx = serverContext;
    this._ssrRenderer = new SsrRenderer(serverContext);
    this._spaRenderer = new SpaRenderer(serverContext);
  }

  renderDocument(req: { url?: string; parsedUrl?: UrlWithParsedQuery }) {
    if (this._serverCtx.app.ssr) {
      return this._ssrRenderer.renderDocument(req);
    }

    return this._spaRenderer.renderDocument(req);
  }
}
