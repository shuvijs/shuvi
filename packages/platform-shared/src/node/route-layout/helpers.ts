import { promises as fs } from 'fs';
import { join, relative, extname, basename } from 'path';
import { normalizeFilePath, normalizeRoutePath } from '../route/route';
import { isDirectory } from '@shuvi/utils/lib/file';

const supportFileTypes = ['page', 'layout', 'middleware', 'api'] as const;
const allowReadFilExtList = ['ts', 'js', 'tsx', 'jsx'] as const;

type GetArrayElementType<T extends readonly any[]> = T extends readonly any[]
  ? T[number]
  : never;

type CapName = Capitalize<GetArrayElementType<typeof supportFileTypes>>;
type FileTypeChecker = Record<`is${CapName}`, (filename: string) => boolean>;
type RouteTypeChecker = Record<
  `has${Capitalize<CapName>}`,
  (files: string[]) => boolean
>;
type RouteUtil = Record<`remove${CapName}`, (files: string[]) => string[]>;

export const getRelativeAtRoot = (path: string) =>
  relative(process.cwd(), path);

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

export const getAllowFilesAndDirs = async (
  files: string[],
  parentPath: string
) => {
  const result: string[] = [];
  const resultHistory: Record<string, { type: string; index: number }> = {};

  for (const file of files) {
    const isDir = await isDirectory(join(parentPath, file));
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

export const exceptionGenerator = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const getErrors = () => {
    return [...errors];
  };

  const getWarnings = () => {
    return [...warnings];
  };

  return {
    getErrors,
    getWarnings,
    addError(error: string) {
      errors.push(error);
    },
    addWarning(warning: string) {
      warnings.push(warning);
    }
  };
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
const routeTypeChecker = {} as RouteTypeChecker;
const routeFilter = {} as RouteUtil;

supportFileTypes.forEach(fileType => {
  const allowNames = allowReadFilExtList.map(ext => `${fileType}.${ext}`);
  const capName = (fileType.charAt(0).toUpperCase() +
    fileType.slice(1)) as CapName;
  fileTypeChecker[`is${capName}`] = (filename: string) => {
    return allowNames.includes(filename);
  };

  routeTypeChecker[`has${capName}`] = files => {
    return files.some(file => fileTypeChecker[`is${capName}`](file));
  };

  routeFilter[`remove${capName}`] = files => {
    return files.filter(file => {
      const pageNames = allowReadFilExtList.map(ext => `${fileType}.${ext}`);
      return !pageNames.includes(file);
    });
  };
});

export { fileTypeChecker, routeTypeChecker, routeFilter };
