import { IAppData } from '@shuvi/platform-shared/lib/runtime';
import { BaseRenderer } from './base';

export class SpaRenderer extends BaseRenderer {
  getDocumentProps() {
    const assets = this._getMainAssetTags();
    const serverPluginContext = this._serverPluginContext;
    const appData: IAppData = {
      ssr: serverPluginContext.config.ssr,
      pageData: {}
    };
    return {
      htmlAttrs: {},
      headTags: [...assets.styles],
      mainTags: [this._getInlineAppData(appData), this._getAppContainerTag()],
      scriptTags: [...assets.scripts]
    };
  }
}
