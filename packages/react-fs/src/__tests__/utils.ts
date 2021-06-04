import { vol } from "memfs";
import fse from "fs-extra";
import path from "path";

interface FileRecord {
  [name: string]: string | FileRecord;
}

export function initFs(obj: FileRecord) {
  const files: { [x: string]: string } = {};
  const dirs: string[] = [];

  const processDirTree = (obj1: FileRecord, filepath = "/") => {
    const keys = Object.keys(obj1);
    if (keys.length <= 0) {
      dirs.push(filepath);
      return;
    }

    keys.forEach(key => {
      const fullpath = path.join(filepath, key);
      const val = obj1[key];
      if (typeof val === "string") {
        files[fullpath] = val;
      } else {
        processDirTree(val, fullpath);
      }
    });
  };

  processDirTree(obj);

  vol.fromJSON(files, "/");
  dirs.forEach(dir => fse.mkdirSync(dir));
}

export function resetFs() {
  vol.reset();
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
      const pp = absolutePath.replace(rootDir, "");

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
