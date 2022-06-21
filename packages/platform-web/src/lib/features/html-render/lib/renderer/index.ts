import { IServerPluginContext } from '@shuvi/service';

import { IRendererConstructorOptions, IRenderDocumentOptions } from './types';
import { BaseRenderer } from './base';
import { SpaRenderer } from './spa';
import { SsrRenderer } from './ssr';

export * from './types';

export class Renderer {
  private _serverPluginContext: IServerPluginContext;
  private _ssrRenderer: BaseRenderer;
  private _spaRenderer: BaseRenderer;

  constructor(options: IRendererConstructorOptions) {
    this._serverPluginContext = options.serverPluginContext;
    this._ssrRenderer = new SsrRenderer(options);
    this._spaRenderer = new SpaRenderer(options);
  }

  renderDocument(options: IRenderDocumentOptions) {
    if (this._serverPluginContext.config.ssr) {
      return this._ssrRenderer.renderDocument(options);
    }

    return this._spaRenderer.renderDocument(options);
  }
}
