import fs from 'fs-extra';
import path from 'path';
import { FileOptions } from '../../file-manager';

/**
 * All preset files are listed in `files` folder as real files arrange.
 * These presets export objects as FileOptions with which fileManager will generate files.
 */
const getAllFiles = (dirPath: string, fileList?: string[]): string[] => {
  const files = fs.readdirSync(dirPath);
  let currentFileList: string[] = fileList || [];
  files.forEach((file: string) => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      currentFileList = getAllFiles(dirPath + '/' + file, currentFileList);
      // Match *.ts (source) or *.js (compiled) file, but ignore *.d.ts file
    } else if (/\.(js|ts)$/.test(file) && !/\.d\.ts$/.test(file)) {
      currentFileList.push(path.join(dirPath, '/', file));
    }
  });
  return currentFileList;
};

const files = getAllFiles(__dirname + '/files');
const filePresets = files.map(
  (file: string): FileOptions => require(file).default
);

export default filePresets;
