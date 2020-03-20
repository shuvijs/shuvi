import { BaseRenderer } from "./base";
import { IServerContext } from "./types";

export class SpaRenderer extends BaseRenderer {
  constructor(ctx: IServerContext) {
    super(ctx);
  }

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
