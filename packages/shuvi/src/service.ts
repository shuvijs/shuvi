import webpack from "webpack";
import { shuvi, Shuvi, ShuviConfig, routerService } from "@shuvi/core";
import { getProjectInfo } from "@shuvi/toolpack/lib/utils/typeScript";
import FsRouterService from "./services/fsRouterService";
import { getClientEntries } from "./helpers/getEntries";
import { getWebpackConfig } from "./getWebpackConfig";
import Server from "./server";
import { LAUNCH_EDITOR_ENDPOINT } from "./constants";

const defaultConfig: ShuviConfig = {
  cwd: process.cwd(),
  outputPath: "dist",
  publicPath: "/"
};

export default class Service {
  private _shuvi: Shuvi;
  private _routerService: routerService.RouterService;

  constructor({ config }: { config: Partial<ShuviConfig> }) {
    this._shuvi = shuvi({ config: { ...defaultConfig, ...config } });
    this._routerService = new FsRouterService();
  }

  async start() {
    const clientConfig = getWebpackConfig(this._shuvi, { node: false });
    const hotClient = require.resolve(
      "@shuvi/toolpack/lib/utils/webpackHotDevClient"
    );
    clientConfig.name = "client";
    clientConfig.entry = [
      `${hotClient}?launchEditorEndpoint=${LAUNCH_EDITOR_ENDPOINT}`,
      ...getClientEntries(this._shuvi)
    ];
    console.log("client webpack config:");
    console.dir(clientConfig, { depth: null });

    const { useTypeScript } = getProjectInfo(this._shuvi.paths.projectDir);
    // const serverConfig = getWebpackConfig(this._shuvi, { node: true });
    const compiler = webpack([clientConfig]);
    const server = new Server(compiler, {
      port: 4000,
      host: "0.0.0.0",
      useTypeScript
    });
    server.start();

    console.log("started");
  }

  private async _prepare() {}

  private async _startServer() {}
}
