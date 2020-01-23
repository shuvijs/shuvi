import resolve from "resolve";
import path from "path";
import fs from "fs";

interface ProjectInfo {
  useTypeScript: boolean;
  typeScriptPath?: string;
  tsConfigPath?: string;
}

const cache: Record<string, ProjectInfo> = Object.create(null);

export function getProjectInfo(projectRoot: string): ProjectInfo {
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
      useTypeScript,
      typeScriptPath,
      tsConfigPath
    };
  }

  return info;
}
