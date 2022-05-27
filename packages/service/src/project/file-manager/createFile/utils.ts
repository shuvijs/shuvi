import fs from 'fs';
import path from 'path';
import { recursiveReadDirSync } from '@shuvi/utils/lib/recursiveReaddir';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { withExts } from '@shuvi/utils/lib/file';

export const getAllFiles = (dependencies: string | string[]) => {
  const allFiles: string[] = [];
  const fileDependencies = Array.isArray(dependencies)
    ? dependencies
    : [dependencies];
  fileDependencies.forEach((filepath: string) => {
    if (fs.existsSync(filepath)) {
      if (fs.statSync(filepath).isDirectory()) {
        allFiles.push(...recursiveReadDirSync(filepath, { rootDir: '' }));
      } else {
        allFiles.push(filepath);
      }
    }
  });
  return allFiles;
};

export const getFirstModuleExport = (
  allFiles: string[],
  candidates: string[],
  defaultExport?: boolean
) => {
  if (allFiles.length) {
    for (let i = 0; i < candidates.length; i++) {
      const currentCandidate = candidates[i];
      const currentLookup = allFiles.find(x => x === currentCandidate);
      if (currentLookup) {
        return defaultExport
          ? `export { default } from "${currentLookup}"`
          : `export * from "${currentLookup}"`;
      }
    }
  }
  return defaultExport ? `export default null` : `export default {}`;
};

export const getUserCustomFileCandidates = (
  rootPath: string,
  fileName: string,
  fallbackType: 'nullish' | 'noop' | 'noopFn'
): string[] => {
  const SRC_DIR = 'src';
  const { useTypeScript } = getTypeScriptInfo(rootPath);
  const moduleFileExtensions = useTypeScript
    ? ['.tsx', '.ts', '.js', '.jsx']
    : ['.js', '.jsx', '.tsx', '.ts'];
  const fallbackMap: Record<typeof fallbackType, string> = {
    nullish: require.resolve('@shuvi/utils/lib/nullish'),
    noop: require.resolve('@shuvi/utils/lib/noop'),
    noopFn: require.resolve('@shuvi/utils/lib/noopFn')
  };
  const fallback = fallbackMap[fallbackType] || fallbackMap['nullish'];
  return [
    ...withExts(path.join(rootPath, SRC_DIR, fileName), moduleFileExtensions),
    fallback
  ];
};
