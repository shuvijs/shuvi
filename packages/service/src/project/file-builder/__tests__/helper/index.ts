import { vol } from 'memfs';
import * as fse from 'fs-extra';
import * as path from 'path';

export function resetFs() {
  vol.reset();
}

export async function readFile(filepath: string) {
  return fse.readFile(filepath, 'utf-8');
}

export async function writeFile(filepath: string, data: any) {
  await fse.writeFile(filepath, data, 'utf-8');
}

export async function recursiveReadDir(
  dir: string,
  {
    rootDir = dir,
    arr = []
  }: {
    rootDir?: string;
    arr?: string[];
  } = {}
): Promise<string[]> {
  const result = await fse.readdir(dir);

  await Promise.all(
    result.map(async (part: string) => {
      const absolutePath = path.join(dir, part);
      const pp = absolutePath.replace(rootDir, '');

      const pathStat = await fse.stat(absolutePath);
      if (pathStat.isDirectory()) {
        await recursiveReadDir(absolutePath, { arr, rootDir });
        return;
      }

      arr.push(pp);
    })
  );

  return arr.sort();
}

export function sleep(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}
