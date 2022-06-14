import { promises as fs } from 'fs';
import { join } from 'path';
import { normalizeFilePath, normalizeRoutePath } from '../route/route';

const supportTypes = ['page', 'layout'] as const;
const allowReadFilExtList = ['ts', 'js', 'tsx', 'jsx'] as const;

type GetArrayElementType<T extends readonly any[]> = T extends readonly any[]
  ? T[number]
  : never;

type CapName = Capitalize<GetArrayElementType<typeof supportTypes>>;
type RouteAllowMethods = Record<`is${CapName}`, (filename: string) => boolean>;

export const normalize = (path: string) => {
  const result = normalizeRoutePath(normalizeFilePath(path));

  if (result === '/') {
    return result;
  }

  return result.replace(/^\//, '');
};

export const getAllowFilesAndDirs = (files: string[], parentPath: string) => {
  return files.filter(file => {
    return (
      // is page.[jt]sx?
      fileTypeChecker.isPage(file) ||
      // is layout.[jt]sx?
      fileTypeChecker.isLayout(file) ||
      // isDir
      isDirectory(join(parentPath, file))
    );
  });
};

export const hasAllowFiles = (files: string[]): boolean =>
  files.some(
    file => fileTypeChecker.isPage(file) || fileTypeChecker.isLayout(file)
  );

export const hasLayout = (files: string[]): boolean =>
  files.some(file => fileTypeChecker.isLayout(file));

export const isDirectory = (dirname: string) => {
  return fs.lstat(dirname).then(stats => {
    return stats.isDirectory();
  });
};

const fileTypeChecker = {} as RouteAllowMethods;

supportTypes.forEach(fileType => {
  const allowNames = allowReadFilExtList.map(ext => `${fileType}.${ext}`);
  const capName = (fileType.charAt(0).toUpperCase() +
    fileType.slice(1)) as CapName;
  fileTypeChecker[`is${capName}`] = (filename: string) => {
    return allowNames.includes(filename);
  };
});

export const readDir = (fullPath: string) => {
  return fs.readdir(fullPath, { encoding: 'utf-8' });
};

export { fileTypeChecker };
