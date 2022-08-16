import { BaseRenderer, AppData } from './base';
import { IRenderViewOptions, IHtmlDocument } from './types';

export class SpaRenderer extends BaseRenderer {
  renderDocument({ req, app }: IRenderViewOptions) {
    const assets = this._getMainAssetTags(req);
    const appData: AppData = {
      ssr: false,
      pageData: {}
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
