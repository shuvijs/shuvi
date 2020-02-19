import { AppCore } from "@shuvi/types/core";
import webpack, {
  MultiCompiler,
  Compiler as WebapckCompiler,
  Configuration
} from "webpack";
import {
  createWepbackConfig,
  getClientEntry,
  getServerEntry
} from "./internal/config";
import { WEBPACK_CONFIG_CLIENT, WEBPACK_CONFIG_SERVER } from "../constants";

class WebpackManagerImpl {
  private _app: AppCore;
  private _compiler: MultiCompiler | null = null;
  private _configs: Configuration[] = [];

  constructor(app: AppCore) {
    this._app = app;
  }

  addConfig(config: Configuration): this {
    if (this._compiler) {
      return this;
    }

    this._configs.push(config);
    return this;
  }

  getCompiler(): MultiCompiler {
    if (!this._compiler) {
      this._compiler = webpack([
        ...this._getInternalConfigs(),
        ...this._configs
      ]);
    }

    return this._compiler!;
  }

  getSubCompiler(name: string): WebapckCompiler | undefined {
    if (!this._compiler) {
      return;
    }

    return this._compiler.compilers.find(compiler => compiler.name === name);
  }

  private _getInternalConfigs(): Configuration[] {
    const clientConfig = createWepbackConfig(this._app, {
      name: WEBPACK_CONFIG_CLIENT,
      node: false
    });
    clientConfig.entry = getClientEntry();
    // console.log("clientConfig");
    // console.dir(clientConfig.module?.rules);

    const serverConfig = createWepbackConfig(this._app, {
      name: WEBPACK_CONFIG_SERVER,
      node: true
    });
    serverConfig.entry = getServerEntry();
    // console.log("serverConfig");


    return [clientConfig, serverConfig];
  }
}

export type WebpackManager = InstanceType<typeof WebpackManagerImpl>;

export function getWebpackManager(app: AppCore): WebpackManager {
  return new WebpackManagerImpl(app);
}
