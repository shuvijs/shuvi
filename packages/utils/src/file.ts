import * as fs from 'fs';
import * as path from 'path';

export function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}${ext}`);
}

export const findFirstExistedFile = (files: string[]): string | null => {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (fs.existsSync(file)) {
      return file;
    }
  }
  return null;
};

export const resolveFile = (fileName: string): string => {
  if (path.extname(fileName)) return fileName;
  const moduleFileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const files = withExts(fileName, moduleFileExtensions);
  const file = findFirstExistedFile(files);
  if (file) {
    return file;
  }
  if (fs.existsSync(fileName) && fs.statSync(fileName).isDirectory()) {
    return resolveFile(path.join(fileName, 'index'));
  }
  throw new Error(`cannot resolve actual file of module: ${fileName}`);
};

export const isDirectory = async (dirname: string) => {
  try {
    const stats = await fs.promises.lstat(dirname);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
};

export const getAbsolutePath = (filepath: string, baseDir: string) => {
  return path.isAbsolute(filepath) ? filepath : path.join(baseDir, filepath);
};

export const getNormalizedPath = (filepath: string) => {
  return filepath.replace(/\\/g, '/');
};

export const getNormalizedAbsolutePath = (
  filepath: string,
  baseDir: string
) => {
  return getNormalizedPath(getAbsolutePath(filepath, baseDir));
};
