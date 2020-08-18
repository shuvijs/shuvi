import { Runtime, AppHooks, IAppError } from '@shuvi/types';
import { htmlEscapeJsonString } from '@shuvi/utils/lib/htmlescape';
import { parse as parseURL } from 'url';
import { matchRoutes } from '@shuvi/core/lib/app/app-modules/matchRoutes';
import {
  IDENTITY_SSR_RUNTIME_PUBLICPATH,
  CLIENT_APPDATA_ID,
  ERROR_PAGE_NOT_FOUND
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
    ErrorComponent,
    routes,
    appContext,
    onRedirect
  }: IRenderDocumentOptions) {
    const api = this._api;
    const {
      clientManifest: manifest,
      server: { view }
    } = this._resources;
    const getAssetPublicUrl = api.getAssetPublicUrl.bind(api);

    let error: IAppError | undefined;
    let result: Runtime.IRenderAppResult | undefined;

    const matchedRoutes = matchRoutes(routes, parseURL(url).pathname || '/');
    if (matchedRoutes.length < 1) {
      error = {
        code: ERROR_PAGE_NOT_FOUND
      };
    } else {
      try {
        result = await view.renderApp({
          url,
          AppComponent,
          ErrorComponent,
          routes,
          appContext,
          manifest,
          getAssetPublicUrl
        });
      } catch (err) {
        error = err;
        result = await view.renderError({
          error: err,
          url,
          AppComponent,
          routes,
          ErrorComponent,
          appContext,
          manifest,
          getAssetPublicUrl
        });
      }

      if (result.redirect) {
        onRedirect(result.redirect);
        return null;
      }
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
      ...result?.appData,
      ssr: api.config.ssr,
      error,
      pageData
    };
    appData.runtimeConfig = getPublicRuntimeConfig(getRuntimeConfig());

    const documentProps = {
      htmlAttrs: { ...result?.htmlAttrs },
      headTags: [
        ...(result?.headBeginTags || []),
        ...mainAssetsTags.styles,
        ...(result?.headEndTags || [])
      ],
      mainTags: [
        this._getInlineAppData(appData),
        ...(result?.mainBeginTags || []),
        this._getAppContainerTag(result?.appHtml),
        ...(result?.mainEndTags || [])
      ],
      scriptTags: [
        tag(
          'script',
          {},
          `${IDENTITY_SSR_RUNTIME_PUBLICPATH} = "${api.assetPublicPath}"`
        ),
        ...(result?.scriptBeginTags || []),
        ...mainAssetsTags.scripts,
        ...(result?.scriptEndTags || [])
      ]
    };

    documentProps.mainTags.push();
    return documentProps;
  }

  private _getInlineAppData(appData: IAppData): IHtmlTag {
    const data = JSON.stringify(appData);
    return tag(
      'script',
      {
        id: CLIENT_APPDATA_ID,
        type: 'application/json'
      },
      htmlEscapeJsonString(data)
    );
  }
}
