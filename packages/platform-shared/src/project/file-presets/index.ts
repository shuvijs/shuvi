import * as fs from 'fs';
import * as path from 'path';
import { FileOptions } from '@shuvi/service/lib/project';
import { ProjectContext } from '../projectContext';

const EXT_REGEXP = /\.[a-zA-Z]+$/;

/**
 * All preset files are listed in `files` folder as real files arrange.
 * These presets export objects as FileOptions with which fileManager will generate files.
 */
const getAllFiles = (
  context: ProjectContext,
  dirPath: string,
  parent: string = '',
  fileList: FileOptions[] = []
): FileOptions[] => {
  const files = fs.readdirSync(dirPath);
  let currentFileList: FileOptions[] = fileList;
  files.forEach((file: string) => {
    const filepath = path.join(dirPath, file);
    const name = path.join(parent, file.replace(EXT_REGEXP, ''));
    if (fs.statSync(filepath).isDirectory()) {
      currentFileList = getAllFiles(context, filepath, name, currentFileList);
      // Match *.ts (source) or *.js (compiled) file, but ignore *.d.ts file
    } else if (/\.(js|ts)$/.test(file) && !/\.d\.ts$/.test(file)) {
      const fileOptionsCreater = require(filepath).default;
      const options = fileOptionsCreater(context);
      currentFileList.push({
        ...options,
        name
      });
    }
  });
  return currentFileList;
};

export function getFilePresets(context: ProjectContext): FileOptions[] {
  return getAllFiles(context, path.join(__dirname, 'files'));
}
