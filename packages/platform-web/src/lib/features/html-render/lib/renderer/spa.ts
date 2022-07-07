import { BaseRenderer, AppData } from './base';
import { IRenderDocumentOptions, IHtmlDocument } from './types';

export class SpaRenderer extends BaseRenderer {
  renderDocument({ app }: IRenderDocumentOptions) {
    const assets = this._getMainAssetTags();
    const serverPluginContext = this._serverPluginContext;
    const appData: AppData = {
      pageData: {},
      ssr: serverPluginContext.config.ssr,
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
