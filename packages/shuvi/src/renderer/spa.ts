import { DEFAULT_HEADS_TAGS } from '@shuvi/runtime-react/lib/head/constants';
import { BaseRenderer } from './base';

export class SpaRenderer extends BaseRenderer {
  getDocumentProps() {
    const assets = this._getMainAssetTags();
    return {
      htmlAttrs: {},
      headTags: [...DEFAULT_HEADS_TAGS, ...assets.styles],
      mainTags: [this._getAppContainerTag()],
      scriptTags: [...assets.scripts]
    };
  }
}
