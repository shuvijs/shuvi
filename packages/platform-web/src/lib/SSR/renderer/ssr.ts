import { IAppData, IData } from '@shuvi/runtime-core';
import { IRouter } from '@shuvi/router';
import { IDENTITY_SSR_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';
import getRuntimeConfig from '@shuvi/service/lib/lib/runtimeConfig';
import { getPublicRuntimeConfig } from '@shuvi/service/lib/lib/getPublicRuntimeConfig';
// @ts-ignore
import { clientManifest, server } from '@shuvi/service/lib/resources';
import { BaseRenderer } from './base';
import { tag } from './htmlTag';
import { IRenderDocumentOptions } from './types';

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps({
    app,
    AppComponent,
    router,
    appStore,
    appContext
  }: IRenderDocumentOptions) {
    const serverPluginContext = this._serverPluginContext;
    const { view } = server;
    const { getAssetPublicUrl, serverPluginRunner } = serverPluginContext;
    const render = serverPluginRunner.render;
    if (!router) {
      throw new Error('router is null');
    }
    const result = await view.renderApp({
      AppComponent,
      router: router as IRouter,
      appStore,
      appContext,
      manifest: clientManifest,
      getAssetPublicUrl,
      render
    });
    if (result.redirect) {
      return {
        $type: 'redirect',
        ...result.redirect
      } as const;
    }

    const mainAssetsTags = this._getMainAssetTags();
    const pageDataList = await serverPluginContext.serverPluginRunner.pageData(
      appContext
    );
    const pageData = pageDataList.reduce((acc, data) => {
      Object.assign(acc, data);
      return acc;
    }, {}) as IData;
    const appData: IAppData = {
      ...result.appData,
      pageData,
      ssr: serverPluginContext.config.ssr
    };
    appData.runtimeConfig = getPublicRuntimeConfig(getRuntimeConfig());

    const documentProps = {
      htmlAttrs: { ...result.htmlAttrs },
      headTags: [
        ...(result.headBeginTags || []),
        ...mainAssetsTags.styles,
        ...(result.headEndTags || [])
      ],
      mainTags: [
        this._getInlineAppData(appData),
        ...(result.mainBeginTags || []),
        this._getAppContainerTag(result.appHtml),
        ...(result.mainEndTags || [])
      ],
      scriptTags: [
        tag(
          'script',
          {},
          `${IDENTITY_SSR_RUNTIME_PUBLICPATH} = "${serverPluginContext.assetPublicPath}"`
        ),
        ...(result.scriptBeginTags || []),
        ...mainAssetsTags.scripts,
        ...(result.scriptEndTags || [])
      ]
    };

    documentProps.mainTags.push();
    return documentProps;
  }
}
