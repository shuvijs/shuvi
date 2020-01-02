import { join } from "path";
import { Paths } from "./types/application";
import { NAME } from "./constants";

interface PathsOpts {
  cwd: string;
  outputPath: string;
}

export function getPaths(opts: PathsOpts): Paths {
  const { cwd, outputPath } = opts;
  const env = process.env.NODE_ENV;
  const toAbsolute = (p: string) => join(cwd, p);

  const buildDir = toAbsolute(outputPath || "./build");
  const pagesDir = toAbsolute("src/pages");

  return {
    projectDir: cwd,
    buildDir,
    // nodeModulesDir: toAbsolute("node_modules"),
    srcDir: toAbsolute("src"),
    appDir: toAbsolute(`.${NAME}/${env}/app`),
    pagesDir
    // pageDocument: join(pagesDir, "document")
    // tmpDir: tmpDirPath
  };
}
