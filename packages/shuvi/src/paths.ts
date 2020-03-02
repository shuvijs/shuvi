import { join } from "path";
import { NAME } from "@shuvi/shared/lib/constants";
import { Paths } from "@shuvi/types";

interface PathsOpts {
  rootDir: string;
  outputPath: string;
}

export function getPaths(opts: PathsOpts): Paths {
  const { rootDir, outputPath } = opts;
  const env = process.env.NODE_ENV;
  const toAbsolute = (p: string) => join(rootDir, p);

  const buildDir = toAbsolute(outputPath || "./build");
  const pagesDir = toAbsolute("src/pages");

  return {
    projectDir: rootDir,
    buildDir,
    // nodeModulesDir: toAbsolute("node_modules"),
    srcDir: toAbsolute("src"),
    appDir: toAbsolute(`.${NAME}/${env}/app`),
    pagesDir
    // pageDocument: join(pagesDir, "document")
    // tmpDir: tmpDirPath
  };
}
