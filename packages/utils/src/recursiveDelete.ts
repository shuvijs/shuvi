import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const fsRmdir = promisify(fs.rmdir);
const fsUnlink = promisify(fs.unlink);
const sleep = promisify(setTimeout);

const unlinkFile = async (p: string, t = 1): Promise<void> => {
  try {
    await fsUnlink(p);
  } catch (e) {
    if (
      (e.code === 'EBUSY' ||
        e.code === 'ENOTEMPTY' ||
        e.code === 'EPERM' ||
        e.code === 'EMFILE') &&
      t < 3
    ) {
      await sleep(t * 100);
      return unlinkFile(p, t++);
    }

    if (e.code === 'ENOENT') {
      return;
    }

    throw e;
  }
};

/**
 * Recursively read directory
 * @param {string} dir Directory to delete
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the relative file path is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the relative file path is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 */
export async function recursiveDelete(
  dir: string,
  {
    filter,
    ignore,
    rootDir = dir
  }: {
    filter?: RegExp;
    ignore?: RegExp;
    rootDir?: string;
  } = {}
): Promise<void> {
  let result;
  try {
    result = await fsReaddir(dir);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return;
    }
    throw e;
  }

  await Promise.all(
    result.map(async (part: string) => {
      const absolutePath = join(dir, part);
      const pathStat = await fsStat(absolutePath).catch((e: any) => {
        if (e.code !== 'ENOENT') throw e;
      });
      if (!pathStat) {
        return;
      }

      const pp = absolutePath.replace(rootDir, '');
      if (ignore && ignore.test(pp)) {
        return;
      }
      if (filter && !filter.test(part)) {
        return;
      }

      if (pathStat.isDirectory()) {
        await recursiveDelete(absolutePath, {
          filter,
          ignore,
          rootDir: pp
        });
        return fsRmdir(absolutePath);
      }

      return unlinkFile(absolutePath);
    })
  );
}
