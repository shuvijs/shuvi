import { BaseRenderer, AppData } from './base';
import { IRenderViewOptions, IHtmlDocument } from './types';

export class SpaRenderer extends BaseRenderer {
  renderDocument({ app }: IRenderViewOptions) {
    const assets = this._getMainAssetTags();
    const appData: AppData = {
      ssr: false,
      pageData: {},
      loadersData: {}
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
