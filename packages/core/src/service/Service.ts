import { joinPath } from "@shuvi/utils/lib/string";
import { logger } from "../lib/logger";
import { Server } from "../server";
import { getPaths, IPaths } from "./paths";
import { IConfig } from "./types";

const log = logger("shuvi:core:service");

const ServiceModes = ["development", "production"] as const;

export type IServiceMode = typeof ServiceModes[number];

interface IServiceOpts {
  rootDir: string;
  mode?: IServiceMode;
  config: IConfig;
}

export class Service {
  mode: IServiceMode;
  paths: IPaths;

  private _config: IConfig;
  private _server?: Server;

  constructor(options: IServiceOpts) {
    log.debug("options");
    log.debug(options);

    const rootDir = options.rootDir || process.cwd();
    this._config = options.config;
    if (options.mode) {
      this.mode = options.mode;
    } else if (ServiceModes.includes(process.env.NODE_ENV as any)) {
      this.mode = process.env.NODE_ENV as any;
    } else {
      this.mode = "production";
    }

    this.paths = getPaths({
      rootDir: rootDir,
      outputPath: this._config.outputPath
    });
  }

  resolveAppFile(...paths: string[]): string {
    return joinPath(this.paths.appDir, ...paths);
  }

  resolveUserFile(...paths: string[]): string {
    return joinPath(this.paths.srcDir, ...paths);
  }

  resolveBuildFile(...paths: string[]): string {
    return joinPath(this.paths.buildDir, ...paths);
  }

  getServer(): Server {
    if (this._server) {
      return this._server;
    }

    this._server = new Server();
    return this._server;
  }
}
