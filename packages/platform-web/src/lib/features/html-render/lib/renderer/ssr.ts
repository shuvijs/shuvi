import {
  IData,
  getPublicRuntimeConfig
} from '@shuvi/platform-shared/lib/runtime';
import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';
import { clientManifest, server } from '@shuvi/service/lib/resources';
import { BaseRenderer, AppData } from './base';
import { tag } from './htmlTag';
import { IRenderDocumentOptions } from './types';

export class SsrRenderer extends BaseRenderer {
  async getDocumentProps({ app, req }: IRenderDocumentOptions) {
    const { router, context } = app;

    const serverPluginContext = this._serverPluginContext;
    const { view } = server;
    const { getAssetPublicUrl } = serverPluginContext;
    if (!router) {
      throw new Error('router is null');
    }
    const result = await view.renderApp({
      app,
      req,
      manifest: clientManifest,
      getAssetPublicUrl
    });
    if (result.redirect) {
      return {
        $type: 'redirect',
        path: result.redirect.headers.get('Location')!,
        status: result.redirect.status
      } as const;
    }

    const mainAssetsTags = this._getMainAssetTags();
    const pageDataList = await serverPluginContext.serverPluginRunner.pageData(
      context
    );
    const pageData = pageDataList.reduce((acc, data) => {
      Object.assign(acc, data);
      return acc;
    }, {}) as IData;
    const appData: AppData = {
      ...result.appData,
      pageData,
      ssr: serverPluginContext.config.ssr
    };
    appData.runtimeConfig = getPublicRuntimeConfig() || {};

    const documentProps = {
      htmlAttrs: { ...result.htmlAttrs },
      headTags: [
        ...(result.headBeginTags || []),
        ...mainAssetsTags.styles,
        ...(result.headEndTags || [])
      ],
      mainTags: [
        this._getInlineAppData(app, appData),
        ...(result.mainBeginTags || []),
        this._getAppContainerTag(result.appHtml),
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

    documentProps.mainTags.push();
    return documentProps;
  }
}
