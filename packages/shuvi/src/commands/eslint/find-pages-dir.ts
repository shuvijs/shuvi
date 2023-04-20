import fs from 'fs';
import path from 'path';

export const existsSync = (f: string): boolean => {
  try {
    fs.accessSync(f, fs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
};

export function findDir(dir: string, name: 'routes'): string | null {
  // prioritize ./src/${name}
  let curDir = path.join(dir, 'src', name);
  if (existsSync(curDir)) return curDir;

  return null;
}

export function findPagesDir(dir: string): string | undefined {
  const pagesDir = findDir(dir, 'routes') || undefined;

  if (!pagesDir) {
    throw new Error(
      "> Couldn't find a `routes` directory. Please create one under the project root/src"
    );
  }

  return pagesDir;
}
