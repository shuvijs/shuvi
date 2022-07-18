import invariant from '@shuvi/utils/lib/invariant';
import { createDefer, Defer } from '@shuvi/utils';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  watch as createWatcher,
  WatchOptions
} from '@shuvi/utils/lib/fileWatcher';
type FileDependency = string | FileOption<any>;

type ContentFunction<T, C> = (context: C, oldContent: T) => T | Promise<T>;

type FileId = string;

interface FileOption<T = string, C = any> {
  name?: string;
  id: FileId;
  virtual?: boolean;
  content: ContentFunction<T, C>;
  dependencies?: FileDependency[];
}

type FileOptionWithoutId<T = string, C = any> = Omit<FileOption<T, C>, 'id'>;

export interface FileInternalInstance<T = string, C = any> {
  name?: string;
  id: FileId;
  virtual?: boolean;
  content: ContentFunction<T, C>;
  fileContent?: T;
}

interface DefineFile {
  <T = string, C = any>(fileOption: FileOptionWithoutId<T, C>): FileOption<
    T,
    C
  >;
}

export const defineFile: DefineFile = <T = string, C = any>(
  fileOption: FileOptionWithoutId<T, C>
) => {
  return {
    ...fileOption,
    id: uuid()
  };
};

type EventHandler = () => void;
type EventCanceler = () => void;

const WATCH_AGGREGATE_TIMEOUT = 100;

interface FileBuilder<C extends {}> {
  addFile: (...newFileOption: FileOption<any, C>[]) => void;
  build: (dir?: string) => Promise<void>;
  watch: (dir?: string) => Promise<void>;
  close: () => Promise<void>;
  getContent: <T>(fileOption: FileOption<T>) => T;
  onBuildStart: (eventHandler: EventHandler) => EventCanceler;
  onBuildEnd: (eventHandler: EventHandler) => EventCanceler;
}

export type DependencyInfo = {
  dependencies: Set<FileId>;
  dependents: Set<FileId>;
};

export const getFileBuilder = <C extends {} = {}>(
  fileContext?: C
): FileBuilder<C> => {
  let rootDir = '/';
  const context = fileContext || {};
  const fileOptions: FileOption<any>[] = [];
  const dependencyMap = new Map<FileId, DependencyInfo>();
  const watchMap = new Map<FileId, WatchOptions>();
  const watcherCancelers: EventCanceler[] = [];
  const files: Map<FileId, FileInternalInstance<any, any>> = new Map();
  let currentDefer: Defer;

  const onBuildStartHandlers = new Set<EventHandler>();
  const onBuildEndHandlers = new Set<EventHandler>();

  const addFile = (...newFileOption: FileOption<any, C>[]) => {
    fileOptions.push(...newFileOption.map(option => ({ ...option })));
  };
  const createInstance = (
    fileOption: FileOption<any>
  ): FileInternalInstance => {
    const instance: FileInternalInstance = {
      ...fileOption
    };
    return instance;
  };

  const getDependencyInfoById = (id: string) => {
    const info = dependencyMap.get(id);
    if (info) return info;
    dependencyMap.set(id, {
      dependencies: new Set(),
      dependents: new Set()
    });
    return dependencyMap.get(id) as DependencyInfo;
  };

  const initFiles = async (
    fileOptions: FileOption<any, any>[],
    needWatch: boolean = false
  ) => {
    await Promise.all(
      fileOptions.map(async currentFile => {
        const { id, dependencies } = currentFile;
        if (currentFile.name) {
          // rootDir as well as Full path name would not be set until mount
          currentFile.name = path.resolve(rootDir, currentFile.name);
        }
        // create instance
        if (!files.get(id)) {
          files.set(id, createInstance(currentFile));
        }
        // collect dependencies
        const currentInfo = getDependencyInfoById(id);
        if (dependencies && dependencies.length) {
          await Promise.all(
            dependencies.map(async dependencyFile => {
              if (typeof dependencyFile === 'string') {
                // only collect watching info when needWatch
                if (needWatch) {
                  const directories: string[] = [];
                  const files: string[] = [];
                  const missing: string[] = [];
                  if (await fs.pathExists(dependencyFile)) {
                    if ((await fs.stat(dependencyFile)).isDirectory()) {
                      directories.push(dependencyFile);
                    } else {
                      files.push(dependencyFile);
                    }
                  } else if (dependencyFile) {
                    missing.push(dependencyFile);
                  }
                  watchMap.set(id, { directories, files, missing });
                }
              } else {
                const dependencyId = dependencyFile.id;
                const currentDependencies = currentInfo.dependencies;
                currentDependencies.add(dependencyId);
                const dependents =
                  getDependencyInfoById(dependencyId).dependents;
                dependents.add(id);
              }
            })
          );
        }
      })
    );
  };

  const addPendingFiles = (
    fileIds: Set<FileId>,
    pendingFileList: Set<string>
  ) => {
    fileIds.forEach(id => {
      pendingFileList.add(id);
      const dependencyInfo = getDependencyInfoById(id);
      const { dependents } = dependencyInfo;
      addPendingFiles(dependents, pendingFileList);
    });
  };

  const ifDependenciesMounted = (
    id: string,
    pendingFileList: Set<FileId>
  ): boolean => {
    const dependencyInfo = getDependencyInfoById(id);
    const { dependencies } = dependencyInfo;
    if (!dependencies.size) return true;
    for (const dep of dependencies) {
      if (pendingFileList.has(dep)) {
        return false;
      }
    }
    return true;
  };

  const runBuild = async (
    id: string,
    pendingFileList: Set<FileId>,
    defer: Defer
  ) => {
    // do nothing if dependencies have not been resolved
    if (!ifDependenciesMounted(id, pendingFileList)) {
      return;
    }
    const current = files.get(id);
    invariant(current);
    const fileContent = await current.content(context, current.fileContent);
    current.fileContent = fileContent;
    if (!current.virtual) {
      fs.writeFileSync(current.name as string, fileContent, 'utf-8');
    }
    pendingFileList.delete(id);
    if (pendingFileList.size === 0) {
      defer.resolve();
    }
    const dependencyInfo = getDependencyInfoById(id);
    const { dependents } = dependencyInfo;
    dependents.forEach(dep => {
      runBuild(dep, pendingFileList, defer);
    });
  };

  const buildOnce = async (sources?: Set<FileId>) => {
    const defer = createDefer<any>();
    currentDefer = defer;
    // files waiting to be built
    const pendingFiles: Set<FileId> = sources
      ? new Set()
      : new Set(files.keys());
    if (sources) {
      // iterate dependencies to collect pending files
      addPendingFiles(sources, pendingFiles);
    }
    onBuildStartHandlers.forEach(handler => {
      handler();
    });
    pendingFiles.forEach(file => {
      runBuild(file, pendingFiles, defer);
    });
    // if no pendingFiles, resolve directly
    if (!pendingFiles.size) {
      defer.resolve();
    }
    await defer.promise;
    onBuildEndHandlers.forEach(handler => {
      handler();
    });
  };

  const addWatchers = () => {
    for (const [id, watchOptions] of watchMap.entries()) {
      const canceler = createWatcher(watchOptions, () => {
        // currently handler has no params
        watcherHandler(id);
      });
      watcherCancelers.push(canceler);
    }
  };

  let currentTimer: NodeJS.Timeout | undefined;
  let currentChangedSources = new Set<FileId>();
  const buildOnceHandler = () => {
    buildOnce(currentChangedSources);
    currentChangedSources.clear();
    currentTimer = undefined;
  };
  const watcherHandler = (id: FileId) => {
    currentChangedSources.add(id);
    if (currentTimer) {
      clearTimeout(currentTimer);
    }
    currentTimer = setTimeout(buildOnceHandler, WATCH_AGGREGATE_TIMEOUT);
  };

  const build = async (dir: string = '/') => {
    rootDir = dir;
    await initFiles(fileOptions);
    await buildOnce();
  };
  const watch = async (dir: string = '/') => {
    rootDir = dir;
    await initFiles(fileOptions, true);
    await buildOnce();
    addWatchers();
  };
  const close = async () => {
    // cancel all watchers
    watcherCancelers.forEach(canceler => {
      canceler();
    });
    // wait for current build
    if (currentDefer) {
      await currentDefer.promise;
    }
    // delete files
    files.forEach(instance => {
      const { name, virtual } = instance;
      if (name && !virtual) {
        fs.unlinkSync(name);
      }
    });
    files.clear();
  };
  const getContent = <T>(fileOption: FileOption<T>) => {
    return files.get(fileOption.id)?.fileContent;
  };
  const onBuildStart = (eventHandler: EventHandler) => {
    onBuildStartHandlers.add(eventHandler);
    return () => {
      onBuildStartHandlers.delete(eventHandler);
    };
  };
  const onBuildEnd = (eventHandler: EventHandler) => {
    onBuildEndHandlers.add(eventHandler);
    return () => {
      onBuildEndHandlers.delete(eventHandler);
    };
  };
  return {
    addFile,
    build,
    watch,
    close,
    getContent,
    onBuildStart,
    onBuildEnd
  };
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
