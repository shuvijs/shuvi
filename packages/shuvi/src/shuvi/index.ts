import { ShuviConfig } from "../config";
import Shuvi from "./shuvi";

export interface ShuviOptions {
  dev?: boolean;
  config: ShuviConfig;
}

export function shuvi({ dev = false, config }: ShuviOptions): Shuvi {
  let ShuviCtor: { new ({ config }: { config: ShuviConfig }): Shuvi };
  if (dev) {
    ShuviCtor = require("./shuvi.dev").default;
  } else {
    ShuviCtor = require("./shuvi.prod").default;
  }

  return new ShuviCtor({ config });
}
