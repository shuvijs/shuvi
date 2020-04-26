import { IServerContext, IRenderRequest } from './types';
import { BaseRenderer, isRedirect } from './base';
import { SpaRenderer } from './spa';
import { SsrRenderer } from './ssr';

export * from './types';

export { isRedirect };

export class Renderer {
  protected _serverCtx: IServerContext;
  private _ssrRenderer: BaseRenderer;
  private _spaRenderer: BaseRenderer;

  constructor(serverContext: IServerContext) {
    this._serverCtx = serverContext;
    this._ssrRenderer = new SsrRenderer(serverContext);
    this._spaRenderer = new SpaRenderer(serverContext);
  }

  renderDocument(req: IRenderRequest) {
    if (this._serverCtx.api.config.ssr) {
      return this._ssrRenderer.renderDocument(req);
    }

    return this._spaRenderer.renderDocument(req);
  }
}
