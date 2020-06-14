import { IRendererConstructorOptions, IRenderDocumentOptions } from './types';
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

  constructor(options: IRendererConstructorOptions) {
    this._api = options.api;
    this._ssrRenderer = new SsrRenderer(options);
    this._spaRenderer = new SpaRenderer(options);
  }

  renderDocument(options: IRenderDocumentOptions) {
    if (this._api.config.ssr) {
      return this._ssrRenderer.renderDocument(options);
    }

    return this._spaRenderer.renderDocument(options);
  }
}
