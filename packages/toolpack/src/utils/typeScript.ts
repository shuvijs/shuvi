import resolve from "resolve";
import path from "path";
import fs from "fs";

interface ProjectInfo {
  typeScriptPath: string;
  useTypeScript: boolean;
  tsConfigPath: string;
}

const cache: Record<string, ProjectInfo> = Object.create(null);

export function getProjectInfo(projectRoot: string) {
  let info = cache[projectRoot];
  if (!info) {
    let typeScriptPath;
    try {
      typeScriptPath = resolve.sync("typescript", {
        basedir: projectRoot
      });
    } catch (_) {}
    const tsConfigPath = path.join(projectRoot, "tsconfig.json");
    const useTypeScript = Boolean(
      typeScriptPath && fs.existsSync(tsConfigPath)
    );
    info = {
      typeScriptPath,
      useTypeScript,
      tsConfigPath
    };
  }

  return info;
}
