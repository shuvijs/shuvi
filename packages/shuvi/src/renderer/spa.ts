import { BaseRenderer } from './base';

export class SpaRenderer extends BaseRenderer {
  getDocumentProps() {
    const assets = this._getMainAssetTags();
    return {
      htmlAttrs: {},
      headTags: [...assets.styles],
      mainTags: [this._getAppContainerTag()],
      scriptTags: [...assets.scripts]
    };
  }
}
