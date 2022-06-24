import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { isDirectory } from '@shuvi/utils/lib/file';
import invariant from '@shuvi/utils/lib/invariant';

const supportFileTypes = ['page', 'layout', 'middleware', 'api'] as const;
const allowReadFilExtList = ['ts', 'js', 'tsx', 'jsx'] as const;

const dynamicMatchAllRegex = /\[\[(.+?)\]\]/g;
const dynamicMatchPartRegex = /\[(.+?)\]/g;

type GetArrayElementType<T extends readonly any[]> = T extends readonly any[]
  ? T[number]
  : never;

export type SupportFileType = GetArrayElementType<typeof supportFileTypes>;

type CapName = Capitalize<SupportFileType>;
type FileTypeChecker = Record<`is${CapName}`, (filename: string) => boolean>;

export function normalizeFilePath(filepath: string) {
  const res = filepath
    // Remove the file extension from the end
    .replace(/\.\w+$/, '')
    // Convert to unix path
    .replace(/\\/g, '/');

  return res.charAt(0) !== '/' ? '/' + res : res;
}

export function parseDynamicPath(normalizedRoute: string): string {
  invariant(
    normalizedRoute.length >= 1,
    'parseDynamicPath param normalizedRoute length should not >= 1'
  );
  invariant(
    !checkSpecialRegexChars(normalizedRoute),
    'filePath should not be special regex chars: |\\{}()^$+*?'
  );
  return normalizedRoute
    .slice(1)
    .split('/')
    .map(segment => {
      let result = '';
      result = segment.replace(
        dynamicMatchAllRegex,
        function (matchString, ...matchArr) {
          return parseMatchRepeat(matchArr[0], true);
        }
      );
      result = result.replace(
        dynamicMatchPartRegex,
        function (matchString, ...matchArr) {
          return parseMatchRepeat(matchArr[0], false);
        }
      );
      return `/${result}`;
    })
    .join('');
}

function parseMatchRepeat(param: string, optional: boolean): string {
  const repeat = param.startsWith('...');
  if (repeat) {
    param = param.slice(3);
  }
  return repeat
    ? optional
      ? `:${param}*`
      : `:${param}+`
    : `:${param}${optional ? '?' : ''}`;
}

function checkSpecialRegexChars(string: string): boolean {
  return /[|\\{}()^$+*?]/g.test(string);
}

export function normalizeRoutePath(rawPath: string) {
  // /xxxx/index -> /xxxx/
  let routePath = rawPath.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (routePath !== '/' && routePath.slice(-1) === '/') {
    routePath = routePath.slice(0, -1);
  }

  routePath = parseDynamicPath(routePath);

  return routePath;
}

export const normalize = (path: string) => {
  const result = normalizeRoutePath(normalizeFilePath(path));

  if (result === '/') {
    return result;
  }

  return result.replace(/^\//, '');
};

export const isRouteFile = (file: string): boolean => {
  return Object.keys(fileTypeChecker).some(key => {
    return fileTypeChecker[key as keyof FileTypeChecker](file);
  });
};

export const getAllowFilesAndDirs = async (dirname: string) => {
  const result: string[] = [];
  const resultHistory: Record<string, { type: string; index: number }> = {};
  const files = await readDir(dirname);
  for (const file of files) {
    const isDir = await isDirectory(join(dirname, file));
    if (isDir) {
      result.push(file);
      continue;
    }
    if (isRouteFile(file)) {
      const ext = extname(file);
      const extWithoutDot = ext.slice(1);
      const pureFilename = basename(file, ext);
      const fileHistory = (resultHistory[pureFilename] =
        resultHistory[pureFilename] || {});
      const { type } = fileHistory;
      switch (extWithoutDot) {
        case 'js':
          if (type) {
            continue;
          }
          fileHistory.type = 'js';
          break;
        case 'jsx':
          if (type) {
            if (['ts', 'tsx'].includes(type)) {
              continue;
            }
            fileHistory.type = 'jsx';
            result[fileHistory.index] = file;
            continue;
          }
          fileHistory.type = 'jsx';
          break;
        case 'ts':
          if (type) {
            if (type === 'tsx') {
              continue;
            }
            fileHistory.type = 'ts';
            result[fileHistory.index] = file;
            continue;
          }
          fileHistory.type = 'ts';
          break;
        case 'tsx':
          fileHistory.type = 'tsx';
          if (type) {
            result[fileHistory.index] = file;
            continue;
          }
          break;
      }
      fileHistory.index = result.length;
      result.push(file);
    }
  }
  return result;
};

export const hasAllowFiles = (files: string[]): boolean =>
  files.some(file => isRouteFile(file));

export const readDir = (fullPath: string) => {
  return fs.readdir(fullPath, { encoding: 'utf-8' });
};

export const hasRouteChildren = async (
  files: string[],
  parentPath: string
): Promise<boolean> => {
  for (const file of files) {
    if (isRouteFile(file)) {
      return true;
    }
    const fullPath = join(parentPath, file);
    if (await isDirectory(fullPath)) {
      let result = await hasRouteChildren(await readDir(fullPath), fullPath);
      if (result) {
        return true;
      }
    }
  }
  return false;
};

const fileTypeChecker = {} as FileTypeChecker;

supportFileTypes.forEach(fileType => {
  const allowNames = allowReadFilExtList.map(ext => `${fileType}.${ext}`);
  const capName = (fileType.charAt(0).toUpperCase() +
    fileType.slice(1)) as CapName;
  fileTypeChecker[`is${capName}`] = (filename: string) => {
    return allowNames.includes(filename);
  };
});

export { fileTypeChecker };
