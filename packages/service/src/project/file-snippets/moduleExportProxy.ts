import { watch } from '@shuvi/utils/lib/fileWatcher';
import { reactive } from '../file-manager';
import fse from 'fs-extra';
import path from 'path';

export const findFirstExistedFile = (files: string[]): string | null => {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (fse.existsSync(file)) {
      return file;
    }
  }
  return null;
};

/**
 * This method receive multiple sources input that will be observed and returns a reactive object wrapping the first existed source.
 */
const getfirstExistedFilesByOrder = (
  lookups: string[],
  fallback: string
): { file: string } => {
  const firstExistedFile = findFirstExistedFile(lookups);
  const finalFile = firstExistedFile || fallback;
  const state = reactive({ file: finalFile });

  // Whenever there is a change, finalFile will be recalculated
  watch({ files: lookups }, () => {
    const currentFirstExistedFile = findFirstExistedFile(lookups);
    if (currentFirstExistedFile) {
      state.file = currentFirstExistedFile;
    } else {
      state.file = fallback;
    }
  });
  return state;
};

export default (source: string | string[], defaultExport?: boolean): string => {
  // the last of source will be fallback file
  const lookups = Array.isArray(source) ? source.slice(0, -1) : [];
  const fallback = Array.isArray(source) ? source[source.length - 1] : source;
  const fileState = getfirstExistedFilesByOrder(lookups, fallback);

  let statements: string[] = [];
  if (defaultExport) {
    statements.push(`export { default } from "${fileState.file}"`);
  } else {
    statements.push(`export * from "${fileState.file}"`);
  }
  return statements.join('\n');
};

const getfirstExistedFiles = (lookups: string[], fallback: string): any => {
  const firstExistedFile = findFirstExistedFile(lookups);
  const finalFile = firstExistedFile || fallback;
  return finalFile;
};

const getWatcher = (
  state: any,
  lookups: string[],
  fallback: string
): (() => void) => {
  return watch({ files: lookups }, () => {
    const currentFirstExistedFile = findFirstExistedFile(lookups);
    if (currentFirstExistedFile) {
      state.file = currentFirstExistedFile;
    } else {
      state.file = fallback;
    }
  });
};

export function removeExt(filePath: string): string {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, parsed.name);
}

export const moduleExportProxyCreater = () => {
  let fileState: { file: string | string[] };
  let watcher: () => void;
  let lookups: string[];
  let fallback: string;

  /**
   * This method returns file content.
   * Would be excuted everytime when updated in development mode
   */
  const getContent = (
    source: string | string[],
    defaultExport?: boolean
  ): string => {
    // the last of source will be fallback file
    lookups = Array.isArray(source) ? source.slice(0, -1) : [];
    fallback = Array.isArray(source) ? source[source.length - 1] : source;
    const finalFile = getfirstExistedFiles(lookups, fallback);
    // fileState would be created only once
    if (!fileState) {
      fileState = reactive({ file: finalFile });
    }
    fileState.file = finalFile;

    // Everytime excuted, watcher would be replaced with a new one.
    // Watcher is created at `mounted` so that in production mode, watcher would not be created.
    // Accurately it is a watcherCloser. A watcherCloser would be return when a watcher is created.
    if (watcher) {
      watcher();
      watcher = getWatcher(fileState, lookups, fallback);
    }
    let statements: string[] = [];
    // remove Ext
    const noExtPath = removeExt(fileState.file as string);
    if (defaultExport) {
      statements.push(`import temp from "${noExtPath}"`);
      statements.push(`export default temp`);
    } else {
      statements.push(`export * from "${noExtPath}"`);
    }
    return statements.join('\n');
  };

  // `mounted` would be excuted only in development mode
  const mounted = () => {
    watcher = getWatcher(fileState, lookups, fallback);
  };

  // `unmounted` would be excuted only in development mode
  const unmounted = () => {
    if (watcher) {
      watcher();
    }
  };
  return {
    getContent,
    mounted,
    unmounted
  };
};
