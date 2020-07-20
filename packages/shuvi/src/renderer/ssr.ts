import { Runtime, AppHooks } from '@shuvi/types';
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
import { isRoutesMatched } from '@shuvi/core/lib/app/utils';

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
      server: {
        renderer: { renderApp, renderError }
      }
    } = this._resources;
    const getAssetPublicUrl = api.getAssetPublicUrl.bind(api);
    let result;
    let errorFlag = {
      hasError: false,
      error: undefined
    };

    try {
      if (!isRoutesMatched(routes, url)) {
        appContext.statusCode = 404;
        errorFlag.hasError = true;
      } else {
        result = await renderApp({
          url,
          AppComponent,
          routes,
          appContext,
          manifest,
          getAssetPublicUrl
        });
      }
    } catch (e) {
      appContext.statusCode = 500;
      errorFlag.hasError = true;
      errorFlag.error = e;
    } finally {
      if (errorFlag.hasError || !result) {
        result = await renderError({
          url,
          error: errorFlag.error,
          appContext,
          manifest,
          getAssetPublicUrl
        });
      }
    }

    if (result.redirect) {
      return {
        $type: 'redirect',
        ...result.redirect
      } as const;
    }

    const mainAssetsTags = this._getMainAssetTags();

    const pageDataList = ((await app.callHook<AppHooks.IHookServerGetPageData>(
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
      ssr: api.config.ssr,
      statusCode: appContext.statusCode
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
