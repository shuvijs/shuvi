import { IServerRendererOptions, IRenderRequest } from './types';
import { BaseRenderer, isRedirect } from './base';
import { SpaRenderer } from './spa';
import { SsrRenderer } from './ssr';
import { Api } from '../api';

export * from './types';

export { isRedirect };

export class Renderer {
  protected _api: Api;
  private _ssrRenderer: BaseRenderer;
  private _spaRenderer: BaseRenderer;

  constructor(options: IServerRendererOptions) {
    this._api = options.api;
    this._ssrRenderer = new SsrRenderer(options);
    this._spaRenderer = new SpaRenderer(options);
  }

  renderDocument(req: IRenderRequest) {
    if (this._api.config.ssr) {
      return this._ssrRenderer.renderDocument(req);
    }

    return this._spaRenderer.renderDocument(req);
  }
}
