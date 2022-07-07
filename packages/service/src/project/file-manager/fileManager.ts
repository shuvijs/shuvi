import * as path from 'path';
import { FileOptionsBase, FileOptions, FileInternalInstance } from './file';
import { mount as mountFile } from './mount';
import { queueJob } from './scheduler';

export interface FileManager {
  addFile(options: FileOptionsBase): void;
  mount(dir: string): Promise<void>;
  unmount(): Promise<void>;
  getContent(options: FileOptionsBase): string;
}

export interface FileManagerOptions {
  watch?: boolean;
  context?: any;
}

export type DependencyInfo = {
  dependencies: string[];
  dependents: string[];
};

export function getFileManager({
  watch = false,
  context
}: FileManagerOptions): FileManager {
  let hasMounted: boolean = false;
  let hasUnMounted: boolean = false;
  let rootDir = '';
  const files: FileOptions[] = [];
  const instances = new Map<string, FileInternalInstance>();
  const dependencyMap = new Map<string, DependencyInfo>();

  const addFile = (options: FileOptionsBase) => {
    if (hasUnMounted) {
      return;
    }
    files.push({
      ...options,
      name: options.name,
      id: options.id || options.name // if id is not provided, use original name as id
    });

    if (hasMounted) {
      queueJob(() => {
        mount(rootDir);
      });
    }
  };

  const _mountFile = async (file: FileOptions) => {
    try {
      const inst = await mountFile(
        file,
        context,
        watch,
        dependencyMap,
        instances
      );
      instances.set(file.id, inst);
    } catch (error) {
      console.log(`fail to mount file ${file.name}`);
      console.error(error);
    }
  };

  const sortFiles = (fileOptions: FileOptions[]) => {
    let files = fileOptions.slice();
    let i = 0;
    while (i < files.length) {
      const currentFile = files[i];
      let moved = false;
      if (currentFile.dependencies) {
        for (const dep of currentFile.dependencies) {
          for (let j = i + 1; j < files.length; j++) {
            const depId = dep.id || dep.name;
            if (files[j].id === depId) {
              // find dependency and put it before current file
              files = [
                ...files.slice(0, i),
                files[j],
                ...files.slice(i, j),
                ...files.slice(j + 1, files.length)
              ];
              moved = true;
            }
          }
        }
      }
      // if moved, currentFile will be refreshed
      // if not moved, we can go next
      if (!moved) {
        i++;
      }
    }
    return files;
  };

  const getDependencyInfoById = (id: string) => {
    const info = dependencyMap.get(id);
    if (info) return info;
    dependencyMap.set(id, {
      dependencies: [],
      dependents: []
    });
    return dependencyMap.get(id) as DependencyInfo;
  };

  const collectDependency = (fileOptions: FileOptions[]) => {
    fileOptions.forEach(currentFile => {
      const { id, dependencies } = currentFile;
      const currentInfo = getDependencyInfoById(id);
      if (dependencies && dependencies.length) {
        dependencies.forEach(dependencyFile => {
          const dependencyId = dependencyFile.id || dependencyFile.name;
          const currentDependencies = currentInfo.dependencies;
          if (!currentDependencies.includes(dependencyId)) {
            currentDependencies.push(dependencyId);
          }
          const dependents = getDependencyInfoById(dependencyId).dependents;
          if (!dependents.includes(id)) {
            dependents.push(id);
          }
        });
      }
    });
  };

  const mount = async (dir: string) => {
    // rootDir is set while mounting
    rootDir = dir;
    if (!hasMounted) {
      hasMounted = true;
    }
    const tasks = [];
    collectDependency(files);
    const sortedFiles = sortFiles(files);
    files.length = 0;
    for (const file of sortedFiles) {
      // rootDir as well as Full path name would not be set until mount
      file.name = path.resolve(rootDir, file.name);
      tasks.push(() => _mountFile(file));
    }

    // await Promise.all(tasks.map(task => task()));
    for (const task of tasks) {
      await task();
    }
  };

  const unmount = async () => {
    const tasks = [];
    for (const [id, inst] of instances.entries()) {
      tasks.push(async () => {
        try {
          await inst.destroy();
          instances.delete(id);
        } catch (error) {
          console.log(`fail to unmount file ${inst.name}`);
          console.error(error);
        }
      });
    }

    await Promise.all(tasks.map(task => task()));

    instances.clear();

    hasMounted = false;
    hasUnMounted = true;
  };

  const getContent = (option: FileOptionsBase): string => {
    const id = option.id || option.name;
    const instance = instances.get(id);
    return instance?.fileContent || '';
  };

  return {
    addFile,
    mount,
    unmount,
    getContent
  };
}
