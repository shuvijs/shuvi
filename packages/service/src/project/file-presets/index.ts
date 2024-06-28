import * as fs from 'fs-extra';
import * as path from 'path';
import {
  defineFile as originalDefineFile,
  FileOptionWithId,
  FileOption
} from '../file-builder';
const EXT_REGEXP = /\.[a-zA-Z]+$/;

/**
 * All preset files are listed in `files` folder as real files arrange.
 * These presets export objects as FileOptions with which fileManager will generate files.
 */
const getAllFiles = (
  dirPath: string,
  parent: string = '',
  fileList: FileOptionWithId<any, any>[] = []
): FileOptionWithId<any, any>[] => {
  const files = fs.readdirSync(dirPath);
  let currentFileList: FileOptionWithId<any, any>[] = fileList;
  files.forEach((file: string) => {
    const filepath = path.join(dirPath, file);
    let name = path.join(parent, file.replace(EXT_REGEXP, ''));
    if (fs.statSync(filepath).isDirectory()) {
      currentFileList = getAllFiles(filepath, name, currentFileList);
      // Match *.ts (source) or *.js (compiled) file, but ignore *.d.ts file
    } else if (/\.(js|ts)$/.test(file) && !/\.d\.ts$/.test(file)) {
      const options = require(filepath).default;

      if (name.endsWith('.d_ts.ts')) {
        name = name.replace('.d_ts.ts', '.d.ts');
      }

      currentFileList.push(
        originalDefineFile({
          ...options,
          name
        })
      );
    }
  });
  return currentFileList;
};

export function getFilePresets() {
  return getAllFiles(path.join(__dirname, 'files'));
}

export type FileOptionWithoutName = Omit<FileOption, 'name'>;

export const defineFile = (options: FileOptionWithoutName) => options;
