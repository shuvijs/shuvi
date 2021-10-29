import { IAppData } from '@shuvi/runtime-core';
import { BaseRenderer } from './base';

export class SpaRenderer extends BaseRenderer {
  getDocumentProps() {
    const assets = this._getMainAssetTags();
    const api = this._api;
    const appData: IAppData = {
      pageData: {},
      ssr: api.config.ssr
    };
    return {
      htmlAttrs: {},
      headTags: [...assets.styles],
      mainTags: [this._getInlineAppData(appData), this._getAppContainerTag()],
      scriptTags: [...assets.scripts]
    };
  }
}
