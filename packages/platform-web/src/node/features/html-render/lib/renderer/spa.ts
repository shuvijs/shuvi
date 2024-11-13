import { getPublicRuntimeConfig } from '@shuvi/platform-shared/shared/shuvi-singleton-runtimeConfig';
import { BaseRenderer, AppData } from './base';
import { IRenderViewOptions, IHtmlDocument } from './types';
import AppConfigManager from '../../../setup-app-config/AppConfigManager';

export class SpaRenderer extends BaseRenderer {
  renderDocument({ req, app }: IRenderViewOptions) {
    const assets = this._getMainAssetTags(req);
    const { basename } = AppConfigManager.getAppConfig(req).router;
    const appData: AppData = {
      ssr: false,
      pageData: {},
      basename,
      runtimeConfig: getPublicRuntimeConfig() || {}
    };

    const document: IHtmlDocument = {
      htmlAttrs: {},
      headTags: [...assets.styles],
      mainTags: [
        this._getInlineAppData(app, appData),
        this._getAppContainerTag()
      ],
      scriptTags: [...assets.scripts]
    };

    return document;
  }
}
