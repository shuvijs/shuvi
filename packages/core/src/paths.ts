import { join } from "path";
import { Paths } from "./types";
import { NAME } from "./constants";

interface PathsOpts {
  cwd: string;
  outputPath: string;
}

export function getPaths(opts: PathsOpts): Paths {
  const { cwd, outputPath } = opts;
  const env = process.env.NODE_ENV;
  const toAbsolute = (p: string) => join(cwd, p);

  const outputDir = toAbsolute(outputPath || "./build");
  const tmpDirPath = toAbsolute(`.${NAME}/${env}/temp`);
  const pagesDir = toAbsolute("src/pages");

  return {
    projectDir: cwd,
    outputDir,
    // nodeModulesDir: toAbsolute("node_modules"),
    srcDir: toAbsolute("src"),
    pagesDir,
    pageDocument: join(pagesDir, "document"),
    tmpDir: tmpDirPath
  };
}
