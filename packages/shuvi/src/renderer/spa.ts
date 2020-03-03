import { BaseRenderer } from "./base";
import { ServerContext } from "./types";

export class SpaRenderer extends BaseRenderer {
  constructor(ctx: ServerContext) {
    super(ctx);
  }

  getDocumentProps() {
    const assets = this._getMainAssetTags();
    return {
      headTags: [...assets.styles],
      mainTags: [this._getAppContainTag()],
      scriptTags: [...assets.scripts]
    };
  }
}
