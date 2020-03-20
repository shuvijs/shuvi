import { useReducer, useEffect, useRef } from "react";
import { watch } from "@shuvi/utils/lib/fileWatcher";
import fse from "fs-extra";

function findFirstExistedFile(files: string[]): string | null {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (fse.existsSync(file)) {
      return file;
    }
  }

  return null;
}

// TODO: extension support eg: jsx/ts/tsx
export function useFileByOrder(...files: string[]) {
  const fallbackFile = files.pop()!;
  const lookupFiles = files;
  const forceupdate = useReducer(s => s * -1, 1)[1];
  const existedFiles = useRef(new Map<string, true>());
  const file = useRef<string>();
  if (!file.current) {
    let initFile: string = fallbackFile;
    const firstExistedFile = findFirstExistedFile(lookupFiles);
    if (firstExistedFile) {
      existedFiles.current.set(firstExistedFile, true);
      initFile = firstExistedFile;
    }

    file.current = initFile;
  }

  useEffect(() => {
    if (lookupFiles.length <= 0) {
      return;
    }

    return watch({ files: lookupFiles }, ({ removals, changes }) => {
      for (let index = 0; index < changes.length; index++) {
        const existed = changes[index];
        existedFiles.current.set(existed, true);
      }
      for (let index = 0; index < removals.length; index++) {
        const removed = removals[index];
        existedFiles.current.delete(removed);
      }

      let nextFile: string = fallbackFile;
      for (let index = 0; index < lookupFiles.length; index++) {
        const lookupFile = lookupFiles[index];
        if (existedFiles.current.has(lookupFile)) {
          nextFile = lookupFile;
          break;
        }
      }

      if (nextFile !== file.current) {
        file.current = nextFile;
        forceupdate({});
      }
    });
  }, [...lookupFiles]);

  return file.current;
}
