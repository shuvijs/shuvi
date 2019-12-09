import { Shuvi } from "@shuvi/core";
import path from "path";

export function getClientEntries(shuvi: Shuvi): string[] {
  return [path.join(shuvi.paths.srcDir, "index")];
}

export function getServerEntries() {}
