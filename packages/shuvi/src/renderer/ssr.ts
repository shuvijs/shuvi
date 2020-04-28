import { Runtime } from '@shuvi/types';
import { BaseRenderer } from './base';
import { IRendererContext } from './types';

import IServerContext = Runtime.IServerContext;

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps(
    serverCtx: IServerContext,
    rendererCtx: IRendererContext
  ) {
    const api = this._api;
    const { renderer, App, routes } = api.resources.server;
    const result = await renderer({
      api,
      App,
      routes,
      manifest: api.resources.clientManifest,
      context: serverCtx
    });
    if (result.redirect) {
      return {
        $type: 'redirect',
        ...result.redirect
      } as const;
    }

    const mainAssetsTags = this._getMainAssetTags();
    Object.assign(rendererCtx.appData, result.appData)
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
        ...mainAssetsTags.scripts,
        ...(result.scriptEndTags || [])
      ]
    };
    return documentProps;
  }
}
