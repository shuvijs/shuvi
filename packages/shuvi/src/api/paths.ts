import { join } from "path";
import { NAME } from "@shuvi/shared/lib/constants";
import { IPaths } from "@shuvi/types";

interface IPathsOpts {
  rootDir: string;
  outputPath: string;
}

export function getPaths(opts: IPathsOpts): IPaths {
  const { rootDir, outputPath } = opts;
  const env = process.env.NODE_ENV;
  const toAbsolute = (p: string) => join(rootDir, p);
  const srcDir = toAbsolute("src");
  const subDir = (p: string) => join(srcDir, p);

  const buildDir = toAbsolute(outputPath || "./build");

  return {
    rootDir,
    buildDir,
    srcDir,
    appDir: toAbsolute(`.${NAME}/${env}/app`),
    pagesDir: subDir("pages")
  };
}
