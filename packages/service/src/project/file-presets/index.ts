import * as fs from 'fs-extra';
import * as path from 'path';
import {
  defineFile as originalDefineFile,
  FileOption,
  FileOptionWithoutId
} from '../file-builder';
const EXT_REGEXP = /\.[a-zA-Z]+$/;

/**
 * All preset files are listed in `files` folder as real files arrange.
 * These presets export objects as FileOptions with which fileManager will generate files.
 */
const getAllFiles = (
  dirPath: string,
  parent: string = '',
  fileList: FileOption<any, any>[] = []
): FileOption<any, any>[] => {
  const files = fs.readdirSync(dirPath);
  let currentFileList: FileOption<any, any>[] = fileList;
  files.forEach((file: string) => {
    const filepath = path.join(dirPath, file);
    const name = path.join(parent, file.replace(EXT_REGEXP, ''));
    if (fs.statSync(filepath).isDirectory()) {
      currentFileList = getAllFiles(filepath, name, currentFileList);
      // Match *.ts (source) or *.js (compiled) file, but ignore *.d.ts file
    } else if (/\.(js|ts)$/.test(file) && !/\.d\.ts$/.test(file)) {
      const options = require(filepath).default;
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

export type FileOptionWithoutName = Omit<FileOptionWithoutId, 'name'>;

export const defineFile = (options: FileOptionWithoutName) => options;
