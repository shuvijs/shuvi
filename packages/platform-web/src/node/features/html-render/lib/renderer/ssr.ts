import { IData, isResponse } from '@shuvi/platform-shared/shared';
import { getPublicRuntimeConfig } from '@shuvi/platform-shared/shared/shuvi-singleton-runtimeConfig';
import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';
import { clientManifest, server } from '@shuvi/service/lib/resources';
import { BaseRenderer, AppData } from './base';
import { tag } from './htmlTag';
import { IHtmlDocument, IRenderViewOptions } from './types';

export class SsrRenderer extends BaseRenderer {
  async renderDocument({ app, req, isDev }: IRenderViewOptions) {
    const { store, router, context } = app;

    const serverPluginContext = this._serverPluginContext;
    const { view } = server;
    if (!router) {
      throw new Error('router is null');
    }
    const result = await view.renderApp({
      app,
      req,
      manifest: clientManifest,
      isDev
    });

    if (isResponse(result)) {
      return result;
    }

    const mainAssetsTags = this._getMainAssetTags(req);
    const pageDataList =
      await serverPluginContext.serverPluginRunner.getPageData(context);
    const pageData = pageDataList.reduce((acc, data) => {
      Object.assign(acc, data);
      return acc;
    }, {}) as IData;
    const appData: AppData = {
      ...result.appData,
      ssr: true,
      appState: store.getState(),
      pageData
    };
    appData.runtimeConfig = getPublicRuntimeConfig() || {};

    const document: IHtmlDocument = {
      htmlAttrs: { ...result.htmlAttrs },
      headTags: [
        ...(result.headBeginTags || []),
        ...mainAssetsTags.styles,
        ...(result.headEndTags || [])
      ],
      mainTags: [
        this._getInlineAppData(app, appData),
        ...(result.mainBeginTags || []),
        this._getAppContainerTag(result.content),
        ...(result.mainEndTags || [])
      ],
      scriptTags: [
        tag(
          'script',
          {},
          `${IDENTITY_RUNTIME_PUBLICPATH} = "${serverPluginContext.assetPublicPath}"`
        ),
        ...(result.scriptBeginTags || []),
        ...mainAssetsTags.scripts,
        ...(result.scriptEndTags || [])
      ]
    };

    return document;
  }
}
