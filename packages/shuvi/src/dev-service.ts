import { shuvi, Shuvi, ShuviConfig, routerService } from "@shuvi/core";
import FsRouterService from "./services/fsRouterService";
import { getWebpackConfig } from "./getWebpackConfig";

const defaultConfig: ShuviConfig = {
  cwd: process.cwd(),
  outputPath: "dist",
  publicPath: "/"
};

export default class DevService {
  private _shuvi: Shuvi;
  private _routerService: routerService.RouterService;

  constructor({ config }: { config: Partial<ShuviConfig> }) {
    this._shuvi = shuvi({ config: { ...defaultConfig, ...config } });
    this._routerService = new FsRouterService();
  }

  async start() {
    await this._prepare();
    const config = getWebpackConfig(this._shuvi, { node: false });
    console.log("webpack config:");
    console.dir(config, { depth: null });
    console.log("started");
  }

  private async _prepare() {}

  private async _startServer() {}
}
