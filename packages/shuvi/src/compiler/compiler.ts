import webpack, {
  MultiCompiler as WebapckMultiCompiler,
  Compiler as WebapckCompiler,
  Configuration
} from "webpack";
import { App } from "@shuvi/types";
import {
  createWepbackConfig,
  getClientEntry,
  getServerEntry
} from "./internal/config";
import { runCompiler, CompilerResult } from "./internal/runCompiler";
import { WEBPACK_CONFIG_CLIENT, WEBPACK_CONFIG_SERVER } from "../constants";

class CompilerImpl {
  private _app: App;
  private _compiler: WebapckMultiCompiler | null = null;
  private _configs: Configuration[] = [];

  constructor(app: App) {
    this._app = app;
  }

  addTarget(config: Configuration): this {
    if (this._compiler) {
      return this;
    }

    this._configs.push(config);
    return this;
  }

  getWebpackCompiler(): WebapckMultiCompiler {
    if (!this._compiler) {
      this._compiler = webpack([
        ...this._getInternalTargets(),
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

  run(): Promise<CompilerResult> {
    return runCompiler(this.getWebpackCompiler());
  }

  private _getInternalTargets(): Configuration[] {
    const clientConfig = createWepbackConfig(this._app, {
      name: WEBPACK_CONFIG_CLIENT,
      node: false
    });
    clientConfig.entry = getClientEntry(this._app);
    // console.log("clientConfig");
    // console.dir(clientConfig);

    const serverConfig = createWepbackConfig(this._app, {
      name: WEBPACK_CONFIG_SERVER,
      node: true
    });
    serverConfig.entry = getServerEntry(this._app);
    // console.log("serverConfig");

    return [clientConfig, serverConfig];
  }
}

export type Compiler = InstanceType<typeof CompilerImpl>;

export function getCompiler(app: App): Compiler {
  return new CompilerImpl(app);
}
