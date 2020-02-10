import fs from "fs";
import path from "path";
import { promisify } from "util";

const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);

/**
 * Recursively read directory
 * @param {string} dir Directory to read
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the name part is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the name part is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @param {string} options.arr This doesn't have to be provided, it's used for the recursion
 * @returns {Promise<string[]>} Promise array holding all relative paths
 */
export async function recursiveReadDir(
  dir: string,
  {
    filter,
    ignore,
    rootDir = dir,
    arr = []
  }: {
    filter?: RegExp;
    ignore?: RegExp;
    rootDir?: string;
    arr?: string[];
  } = {}
): Promise<string[]> {
  const result = await fsReaddir(dir);

  await Promise.all(
    result.map(async (part: string) => {
      const absolutePath = path.join(dir, part);
      const pp = absolutePath.replace(rootDir, "");
      if (ignore && ignore.test(pp)) {
        return;
      }

      const pathStat = await fsStat(absolutePath);
      if (pathStat.isDirectory()) {
        await recursiveReadDir(absolutePath, { filter, ignore, arr, rootDir });
        return;
      }

      if (filter && !filter.test(part)) {
        return;
      }
      arr.push(pp);
    })
  );

  return arr.sort();
}

/**
 * Recursively read directory
 * @param {string} dir Directory to read
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the name part is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the name part is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @param {string} options.arr This doesn't have to be provided, it's used for the recursion
 * @returns {string[]} Promise array holding all relative paths
 */
export function recursiveReadDirSync(
  dir: string,
  {
    filter,
    ignore,
    rootDir = dir,
    arr = []
  }: {
    filter?: RegExp;
    ignore?: RegExp;
    rootDir?: string;
    arr?: string[];
  } = {}
): string[] {
  const result = fs.readdirSync(dir);

  result.forEach((part: string) => {
    const absolutePath = path.join(dir, part);
    if (ignore && ignore.test(part)) return;

    const pathStat = fs.statSync(absolutePath);

    if (pathStat.isDirectory()) {
      recursiveReadDirSync(absolutePath, { filter, ignore, arr, rootDir });
      return;
    }

    if (filter && !filter.test(part)) {
      return;
    }

    arr.push(absolutePath.replace(rootDir, ""));
  });

  return arr.sort();
}
