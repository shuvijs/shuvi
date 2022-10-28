import { stat as fileStat } from 'fs-extra';
import { resolve } from '@shuvi/utils/lib/resolve';
import { recursiveReadDir } from '@shuvi/utils/lib/recursiveReaddir';

export interface PackageDep {
  file: string;
  pkg: string;
}

export type CheckedDependenciesResult = {
  resovled: Map<string, string>; // <pkg, resolvePath>
  missing: PackageDep[];
};

const requiredPackages = [
  { file: 'typescript', pkg: 'typescript' },
  { file: '@types/react/index.d.ts', pkg: '@types/react' },
  { file: '@types/react-dom/index.d.ts', pkg: '@types/react-dom' },
  { file: '@types/node/index.d.ts', pkg: '@types/node' }
];

export function resolveDependencies(
  dir: string,
  deps: PackageDep[]
): CheckedDependenciesResult {
  let resolutions = new Map<string, string>();

  const missingPackages = deps.filter(p => {
    try {
      resolutions.set(p.pkg, resolve(p.file, { basedir: dir }));
      return false;
    } catch (_) {
      return true;
    }
  });

  return {
    resovled: resolutions,
    missing: missingPackages
  };
}

export async function hasTypescriptFiles(projectDir: string): Promise<boolean> {
  try {
    const stats = await fileStat(projectDir);
    if (!stats.isDirectory()) {
      return false;
    }
  } catch (error) {
    return false;
  }

  const typescriptFiles = await recursiveReadDir(projectDir, {
    filter: /.*\.(ts|tsx)$/,
    ignore: /(\.shuvi)|(node_modules|.*\.d\.ts)/
  });

  return typescriptFiles.length > 0;
}

export function checkNecessaryDeps(
  projectDir: string
): CheckedDependenciesResult {
  return resolveDependencies(projectDir, requiredPackages);
}
