import * as fs from 'fs';
import { reactive } from '@vue/reactivity';
import { watch } from '@shuvi/utils/lib/fileWatcher';
import { FileOptions } from '../file';

export type FileOptionsWithoutName = Omit<FileOptions, 'name'>;

export type DefineFileOption = {
  name: string;
  content: () => string | Promise<string>;
  dependencies?: (string | FileOptions)[];
};

export type DefineFileOptionSyncWithContext<C = any> = {
  name: string;
  content: (context: C) => string;
  dependencies?: (string | FileOptions)[];
};

/** options without context async */
export function defineFile(options: DefineFileOption): FileOptions;

/** options with context sync*/
export function defineFile<C = any>(
  options: DefineFileOptionSyncWithContext<C>
): FileOptions;

export function defineFile<C = any>(options: any): any {
  let fileState: { content: string };
  let fileContent: string;
  let initiated = false;
  let watcher: () => void;
  let getWatcher: () => () => void;
  let currentInstance: any;
  const mounted = function (this: any) {
    watcher = getWatcher();
    currentInstance = this._;
  };
  const unmounted = () => {
    currentInstance = null;
    watcher();
  };
  const { dependencies: rawDependencies = [], content } = options as
    | DefineFileOption
    | DefineFileOptionSyncWithContext;
  const files: string[] = [];
  const directories: string[] = [];
  const missing: string[] = [];
  const dependencies: FileOptions[] = [];
  rawDependencies.forEach(fileDependency => {
    if (typeof fileDependency === 'string') {
      const filepath = fileDependency;
      if (fs.existsSync(filepath)) {
        if (fs.statSync(filepath).isDirectory()) {
          directories.push(filepath);
        } else {
          files.push(filepath);
        }
      } else if (filepath) {
        missing.push(filepath);
      }
    } else {
      dependencies.push(fileDependency);
    }
  });
  if (
    !rawDependencies.length ||
    rawDependencies.length === dependencies.length
  ) {
    return options;
  }
  let isPromise = false;
  getWatcher = () => {
    return watch({ files, directories, missing }, async () => {
      if (!currentInstance) return;
      if (isPromise) {
        fileContent = await content(currentInstance?.ctx);
        currentInstance?.update();
      } else {
        fileState.content = content(currentInstance?.ctx) as string;
      }
    });
  };

  const getContent = (context: C) => {
    if (!initiated) {
      const contentResult = content(context);
      if (contentResult instanceof Promise) {
        isPromise = true;
        return contentResult.then(result => {
          initiated = true;
          fileContent = result;
          return fileContent;
        });
      } else {
        fileState = reactive({
          content: contentResult
        });
        initiated = true;
      }
    }
    return isPromise ? fileContent : fileState.content;
  };
  return {
    name: options.name,
    id: uuid(),
    content: getContent,
    dependencies,
    mounted,
    unmounted
  };
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
