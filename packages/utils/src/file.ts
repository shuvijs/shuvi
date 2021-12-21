import fs from 'fs'

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
