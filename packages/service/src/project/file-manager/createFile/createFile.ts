import fs from 'fs';
import { reactive } from '@vue/reactivity';
import { watch } from '@shuvi/utils/lib/fileWatcher';

import { FileOptions } from '../file';

export type FileOptionsWithoutName = Omit<FileOptions, 'name'>;

export type CreateFileOption = {
  name: string;
  content: () => string;
  dependencies?: string | string[];
};

export type CreateFileOptionWithContext<C = any> = {
  name: string;
  content: (context: C) => string;
};

export type CreateFileOptionWithoutName = Omit<CreateFileOption, 'name'>;
export type CreateFileOptionWithContextWithoutName<C> = Omit<
  CreateFileOptionWithContext<C>,
  'name'
>;

/** used by file-presets because their names are dynamically generated by their paths*/
export function createFileWithoutName<C = any>(
  options: CreateFileOptionWithContextWithoutName<C>
): FileOptionsWithoutName;
export function createFileWithoutName<C = any>(
  initializer: (context: C) => CreateFileOptionWithoutName
): FileOptionsWithoutName;
export function createFileWithoutName<C = any>(options: any): any {
  return createFile<C>(options);
}

export function createFile(options: CreateFileOption): FileOptions;
export function createFile<C = any>(
  options: CreateFileOptionWithContext<C>
): FileOptions;
export function createFile<C = any>(
  initializer: (context: C) => CreateFileOptionWithoutName,
  name: string
): FileOptions;
export function createFile<C = any>(options: any, name?: string): any {
  let fileState: { content: string };
  let watcher: () => void;
  let getWatcher: () => () => void;
  const mounted = () => {
    watcher = getWatcher();
  };
  const unmounted = () => {
    watcher();
  };
  if (typeof options === 'function') {
    const getContent = (context: C) => {
      const createFileOptions = options(context) as CreateFileOptionWithoutName;
      const { dependencies = [], content } = createFileOptions;
      const files: string[] = [];
      const directories: string[] = [];
      const missing: string[] = [];
      const fileDependencies = Array.isArray(dependencies)
        ? dependencies
        : [dependencies];
      fileDependencies.forEach((filepath: string) => {
        if (fs.existsSync(filepath)) {
          if (fs.statSync(filepath).isDirectory()) {
            directories.push(filepath);
          } else {
            files.push(filepath);
          }
        } else if (filepath) {
          missing.push(filepath);
        }
      });
      if (!fileState) {
        fileState = reactive({
          content: content()
        });
      } else {
        fileState.content = content();
      }
      getWatcher = () => {
        return watch({ files, directories, missing }, () => {
          fileState.content = content();
        });
      };
      if (watcher) {
        watcher();
        watcher = getWatcher();
      }
      return fileState.content;
    };
    return {
      name,
      content: getContent,
      mounted,
      unmounted
    };
  }
  const { dependencies = [], content } = options as CreateFileOption;
  const files: string[] = [];
  const directories: string[] = [];
  const missing: string[] = [];
  const fileDependencies = Array.isArray(dependencies)
    ? dependencies
    : [dependencies];
  if (!fileDependencies.length) {
    return options;
  }
  fileDependencies.forEach((filepath: string) => {
    if (fs.existsSync(filepath)) {
      if (fs.statSync(filepath).isDirectory()) {
        directories.push(filepath);
      } else {
        files.push(filepath);
      }
    } else if (filepath) {
      missing.push(filepath);
    }
  });
  fileState = reactive({
    content: content()
  });
  getWatcher = () => {
    return watch({ files, directories, missing }, () => {
      fileState.content = content();
    });
  };
  return {
    name: options.name,
    content: () => fileState.content,
    mounted,
    unmounted
  };
}