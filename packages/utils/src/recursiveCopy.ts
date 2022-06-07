import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { Sema } from 'async-sema';

const fsMkdir = promisify(fs.mkdir);
const fsStat = promisify(fs.stat);
const fsReaddir = promisify(fs.readdir);
const fsCopyFile = promisify(fs.copyFile);

const COPYFILE_EXCL = fs.constants.COPYFILE_EXCL;

export async function recursiveCopy(
  source: string,
  dest: string,
  {
    concurrency = 255,
    filter = () => true
  }: { concurrency?: number; filter?(path: string): boolean } = {}
) {
  const cwdPath = process.cwd();
  const from = path.resolve(cwdPath, source);
  const to = path.resolve(cwdPath, dest);

  const sema = new Sema(concurrency);

  async function _copy(item: string) {
    const target = item.replace(from, to);
    const stats = await fsStat(item);

    await sema.acquire();

    if (stats.isDirectory()) {
      try {
        await fsMkdir(target);
      } catch (err: any) {
        // do not throw `folder already exists` errors
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
      const files = await fsReaddir(item);
      await Promise.all(files.map(file => _copy(path.join(item, file))));
    } else if (
      stats.isFile() &&
      // before we send the path to filter
      // we remove the base path (from) and replace \ by / (windows)
      filter(item.replace(from, '').replace(/\\/g, '/'))
    ) {
      await fsCopyFile(item, target, COPYFILE_EXCL);
    }

    sema.release();
    return;
  }

  await _copy(from);
}
