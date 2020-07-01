import { Runtime, RuntimeHooks } from '@shuvi/types';
import { htmlEscapeJsonString } from '@shuvi/utils/lib/htmlescape';
import {
  IDENTITY_SSR_RUNTIME_PUBLICPATH,
  CLIENT_APPDATA_ID
} from '../constants';
import getRuntimeConfig from '../lib/runtimeConfig';
import { getPublicRuntimeConfig } from '../lib/getPublicRuntimeConfig';
import { BaseRenderer } from './base';
import { tag } from './htmlTag';
import { IRenderDocumentOptions } from './types';

import IData = Runtime.IData;
import IAppData = Runtime.IAppData;
import IHtmlTag = Runtime.IHtmlTag;

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps({
    app,
    url,
    AppComponent,
    routes,
    appContext
  }: IRenderDocumentOptions) {
    const api = this._api;
    const {
      clientManifest: manifest,
      server: { renderer }
    } = this._resources;
    const getAssetPublicUrl = api.getAssetPublicUrl.bind(api);
    const result = await renderer({
      url,
      AppComponent,
      routes,
      appContext,
      manifest,
      getAssetPublicUrl
    });
    if (result.redirect) {
      return {
        $type: 'redirect',
        ...result.redirect
      } as const;
    }

    const mainAssetsTags = this._getMainAssetTags();

    const pageDataList = ((await app.callHook<
      RuntimeHooks.IHookServerGetPageData
    >(
      {
        name: 'server:getPageData',
        parallel: true
      },
      appContext
    )) as any) as IData[];
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

  private _getInlineAppData(appData: IAppData): IHtmlTag {
    const data = JSON.stringify(appData);
    return tag(
      'textarea',
      {
        id: CLIENT_APPDATA_ID,
        style: 'display: none'
      },
      htmlEscapeJsonString(data)
    );
  }
}
