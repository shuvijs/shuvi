import { IAppData, IData } from '../types/runtime';
import { AppHooks } from '@shuvi/runtime-core';
import { IRouter } from '@shuvi/router';
import { IDENTITY_SSR_RUNTIME_PUBLICPATH } from '../constants';
import getRuntimeConfig from '../lib/runtimeConfig';
import { getPublicRuntimeConfig } from '../lib/getPublicRuntimeConfig';
import { BaseRenderer } from './base';
import { tag } from './htmlTag';
import { IRenderDocumentOptions } from './types';

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps({
    app,
    AppComponent,
    router,
    appStore,
    appContext,
    render
  }: IRenderDocumentOptions) {
    const api = this._api;
    const {
      clientManifest: manifest,
      server: { view }
    } = this._resources;
    const getAssetPublicUrl = api.getAssetPublicUrl.bind(api);
    if (!router) {
      throw new Error('router is null');
    }
    const result = await view.renderApp({
      AppComponent,
      router: router as IRouter,
      appStore,
      appContext,
      manifest,
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

    const pageDataList = (await app.callHook<AppHooks.IHookServerGetPageData>(
      {
        name: 'server:getPageData',
        parallel: true
      },
      appContext
    )) as any as IData[];
    const pageData = pageDataList.reduce((acc, data) => {
      Object.assign(acc, data);
      return acc;
    }, {});
    const appData: IAppData = {
      ...result.appData,
      pageData,
      ssr: api.config.ssr
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
          `${IDENTITY_SSR_RUNTIME_PUBLICPATH} = "${api.assetPublicPath}"`
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
