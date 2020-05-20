import { Runtime } from '@shuvi/types';
import { IDENTITY_SSR_RUNTIME_PUBLICPATH } from '../constants';
import { BaseRenderer } from './base';
import { IServerRendererContext } from './types';
import { tag } from './htmlTag';

import IServerContext = Runtime.IServerContext;

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps(
    serverCtx: IServerContext,
    rendererCtx: IServerRendererContext
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
    Object.assign(rendererCtx.appData, result.appData);
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
        tag(
          'script',
          {},
          `${IDENTITY_SSR_RUNTIME_PUBLICPATH} = "${api.assetPublicPath}"`
        ),
        ...(result.scriptBeginTags || []),
        ...mainAssetsTags.scripts,
        ...(result.scriptEndTags || [])
      ]
    };
    return documentProps;
  }
}
