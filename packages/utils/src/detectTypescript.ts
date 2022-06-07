import * as resolve from 'resolve';
import * as path from 'path';
import * as fs from 'fs';

interface TypeScriptInfo {
  useTypeScript: boolean;
  typeScriptPath?: string;
  tsConfigPath?: string;
}

const cache: Record<string, TypeScriptInfo> = Object.create(null);

export function getTypeScriptInfo(projectRoot: string): TypeScriptInfo {
  let info = cache[projectRoot];
  if (!info) {
    let typeScriptPath;
    try {
      typeScriptPath = resolve.sync('typescript', {
        basedir: projectRoot
      });
    } catch (_) {}
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    const useTypeScript = Boolean(
      typeScriptPath && fs.existsSync(tsConfigPath)
    );
    info = {
      useTypeScript,
      ...(useTypeScript === true && { typeScriptPath, tsConfigPath })
    };
  }

  return info;
}
