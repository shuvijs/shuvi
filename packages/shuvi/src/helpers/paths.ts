import { join } from "path";

export function getBuildPath(buildDir: string, path: string) {
  return join(buildDir, path);
}
