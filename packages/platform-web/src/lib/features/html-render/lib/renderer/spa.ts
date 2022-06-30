import { BaseRenderer, AppData } from './base';
import { IRenderDocumentOptions } from './types';

export class SpaRenderer extends BaseRenderer {
  getDocumentProps({ app }: IRenderDocumentOptions) {
    const assets = this._getMainAssetTags();
    const serverPluginContext = this._serverPluginContext;
    const appData: AppData = {
      pageData: {},
      ssr: serverPluginContext.config.ssr,
      loadersData: {}
    };
    return {
      htmlAttrs: {},
      headTags: [...assets.styles],
      mainTags: [
        this._getInlineAppData(app, appData),
        this._getAppContainerTag()
      ],
      scriptTags: [...assets.scripts]
    };
  }
}
