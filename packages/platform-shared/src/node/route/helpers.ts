import fs from 'fs';
import { join, extname, basename } from 'path';
import { isDirectory } from '@shuvi/utils/lib/file';
import invariant from '@shuvi/utils/lib/invariant';
import { RouteConfigType } from './route';
import { rankRouteBranches } from '../../shared/router';

const supportFileTypes = ['page', 'layout', 'middleware', 'api'] as const;
const allowReadFilExtList = ['ts', 'js', 'tsx', 'jsx'] as const;

const dynamicMatchAllRegex = /\$$/;
const dynamicMatchPartRegex = /\$/g;

type GetArrayElementType<T extends readonly any[]> = T extends readonly any[]
  ? T[number]
  : never;

export type SupportFileType = GetArrayElementType<typeof supportFileTypes>;

type CapName = Capitalize<SupportFileType>;
type FileTypeChecker = Record<`is${CapName}`, (filename: string) => boolean>;

export function parseDynamicPath(normalizedRoute: string): string {
  invariant(
    !checkSpecialRegexChars(normalizedRoute),
    'filePath should not be special regex chars: |\\{}()^:+*?'
  );
  return normalizedRoute
    .replace(dynamicMatchAllRegex, '*')
    .replace(dynamicMatchPartRegex, ':');
}

function checkSpecialRegexChars(string: string): boolean {
  return /[|\\{}()^:+*?]/g.test(string);
}

export function normalizeRoutePath(rawPath: string) {
  let routePath = rawPath
    // Remove the file extension from the end
    .replace(/\.\w+$/, '')
    // Convert to unix path
    .replace(/\\/g, '/');

  // /xxxx/index -> /xxxx/
  routePath = rawPath.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (routePath !== '/' && routePath.slice(-1) === '/') {
    routePath = routePath.slice(0, -1);
  }

  routePath = parseDynamicPath(routePath);

  return routePath;
}

export function combineComponents(fisrt: string, sec: string) {
  if (fisrt === '' || sec === '') {
    return `${fisrt}${sec}`;
  }

  if (fisrt.endsWith('/')) {
    if (sec.startsWith('/')) {
      return `${fisrt}${sec.slice(1)}`;
    } else {
      return `${fisrt}${sec}`;
    }
  } else if (sec.startsWith('/')) {
    return `${fisrt}${sec}`;
  } else {
    return `${fisrt}/${sec}`;
  }
}

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

export const readDir = (fullPath: string) => {
  return fs.promises.readdir(fullPath, { encoding: 'utf-8' });
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

function sortRoutes<T extends { path: string; children?: T[] }>(
  routes: T[]
): T[] {
  let rankRoutes = routes.map(route => {
    return [route.path, route] as [string, RouteConfigType];
  });
  rankRoutes = rankRouteBranches(rankRoutes);

  return rankRoutes.map(rankRoute => {
    const rankRawRoute = rankRoute[1] as T;
    if (rankRawRoute.children) {
      rankRawRoute.children = sortRoutes(rankRawRoute.children) as any[];
    }
    return rankRoute[1] as T;
  });
}

export { fileTypeChecker, sortRoutes };
