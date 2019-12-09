import { ShuviConfig, ShuviCore, Paths } from "./types";
import { getPaths } from "./paths";

export interface ShuviOptions {
  config: ShuviConfig;
}

class ShuviCoreImpl implements ShuviCore {
  public config: ShuviConfig;
  public paths: Paths;

  constructor({ config }: ShuviOptions) {
    this.config = config;
    this.paths = getPaths({
      cwd: this.config.cwd,
      outputPath: this.config.outputPath
    });
  }
}

export function shuvi(options: ShuviOptions) {
  return new ShuviCoreImpl(options);
}
