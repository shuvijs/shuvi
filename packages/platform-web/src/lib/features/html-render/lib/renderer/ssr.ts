import { IAppData, IData } from '@shuvi/platform-shared/lib/runtime';
import { IRouter } from '@shuvi/router';
import { IDENTITY_SSR_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';
import {
  getPublicRuntimeConfig,
  getRuntimeConfig
} from '@shuvi/platform-shared/lib/lib';
import { clientManifest, server } from '@shuvi/service/lib/resources';
import { BaseRenderer } from './base';
import { tag } from './htmlTag';
import { IRenderDocumentOptions } from './types';

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps({
    app,
    AppComponent,
    router,
    modelManager,
    appContext
  }: IRenderDocumentOptions) {
    const serverPluginContext = this._serverPluginContext;
    const { view } = server;
    const { getAssetPublicUrl } = serverPluginContext;
    if (!router) {
      throw new Error('router is null');
    }
    const result = await view.renderApp({
      AppComponent,
      router: router as IRouter,
      modelManager,
      appContext,
      manifest: clientManifest,
      getAssetPublicUrl
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
