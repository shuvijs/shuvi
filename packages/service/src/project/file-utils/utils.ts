import * as fs from 'fs';
import * as path from 'path';
import { recursiveReadDirSync } from '@shuvi/utils/lib/recursiveReaddir';
import { withExts } from '@shuvi/utils/lib/file';
import { isWindowsSystem, pathToFileUrl } from '@shuvi/utils/lib/platform';

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

export const getModuleExport = (module: string, defaultExport?: boolean) => {
  if (module) {
    if (isWindowsSystem()) {
      module = pathToFileUrl(module);
    }

    return defaultExport
      ? `export { default } from "${module}"`
      : `export * from "${module}"`;
  }
  return defaultExport ? `export default null` : `export default {}`;
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
        return getModuleExport(currentLookup, defaultExport);
      }
    }
  }
  return getModuleExport('', defaultExport);
};

export const getUserCustomFileCandidates = (
  rootPath: string,
  fileName: string,
  fallbackType: 'nullish' | 'noop' | 'noopFn'
): string[] => {
  const SRC_DIR = 'src';
  const moduleFileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
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

export const getContentProxyObj = (Obj: {
  [key: string]: string | undefined;
}): string => {
  const statements: string[] = [];
  const sources = Object.keys(Obj);

  for (let source of sources) {
    const exportContents = Obj[source];

    statements.push(
      `proxyObj.${source} ${
        exportContents
          ? ` = function() {return require("${exportContents}")}`
          : ''
      };`
    );
  }

  return `
const proxyObj = {};
module.exports = proxyObj;
  ${statements.join('\n')}
  `;
};

const getExportsContent = (
  exports: { [source: string]: string | string[] },
  stripFullPath: boolean = false
): string => {
  const statements: string[] = [];
  const sources = Object.keys(exports);

  for (let source of sources) {
    const exportContents = ([] as string[]).concat(exports[source]);

    // stripFullPath because type definition unable to read full path.
    if (stripFullPath) {
      source = source.substring(source.indexOf('node_modules'));
    }
    if (isWindowsSystem()) {
      source = pathToFileUrl(source);
    }
    for (const exportContent of exportContents) {
      statements.push(`export ${exportContent} from "${source}"`);
    }
  }

  return statements.join('\n');
};

export const getExportsFromObject = (exports: {
  [source: string]: string[];
}): string => getExportsContent(exports);
