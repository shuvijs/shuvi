import invariant from '@shuvi/utils/lib/invariant';
import { createDefer, Defer } from '@shuvi/utils';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  watch as createWatcher,
  WatchOptions
} from '@shuvi/utils/lib/fileWatcher';
import { uuid, ifIntersect } from './utils';
import { WATCH_AGGREGATE_TIMEOUT } from './constants';
import type {
  FileId,
  FileOption,
  FileInternalInstance,
  BuildInfo,
  DependencyInfo
} from './types';

type EventHandler = () => void;
type EventCanceler = () => void;

export interface FileBuilder<C extends {}> {
  addFile: (...newFileOption: FileOption<any, C>[]) => void;
  build: (dir?: string) => Promise<void>;
  watch: (dir?: string) => Promise<void>;
  close: () => Promise<void>;
  getContent: <T>(fileOption: FileOption<T>) => T;
  onBuildStart: (eventHandler: EventHandler) => EventCanceler;
  onBuildEnd: (eventHandler: EventHandler) => EventCanceler;
}

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
  let currentDefer: Defer; // mark current defer for closing

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

  const runBuildSingleFile = async (
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
      const filePath = current.name as string;
      const dir = path.dirname(filePath);
      fs.ensureDirSync(dir);
      fs.writeFileSync(current.name as string, fileContent, 'utf-8');
    }
    pendingFileList.delete(id);
    if (pendingFileList.size === 0) {
      defer.resolve();
    }
    const dependencyInfo = getDependencyInfoById(id);
    const { dependents } = dependencyInfo;
    dependents.forEach(dep => {
      runBuildSingleFile(dep, pendingFileList, defer);
    });
  };

  const runningBuilds = new Map<string, BuildInfo>();
  const awaitingBuilds = new Map<string, BuildInfo>();

  /**
   * drop and its relationship will be merged into remain and remain's
   */
  const mergeBuilds = (remain: BuildInfo, drop: BuildInfo) => {
    awaitingBuilds.set(remain.id, remain);
    // merge files
    drop.files.forEach(file => {
      remain.files.add(file);
    });
    // replace fronts and rears
    // fronts must be runningBuilds
    drop.fronts.forEach(front => {
      remain.fronts.add(front);
      const frontBuild = runningBuilds.get(front);
      if (frontBuild) {
        frontBuild.rears.delete(drop.id);
        frontBuild.rears.add(remain.id);
      }
    });

    // rears must be awaitingBuilds
    drop.rears.forEach(rear => {
      remain.rears.add(rear);
      const rearBuild = awaitingBuilds.get(rear);
      if (rearBuild) {
        rearBuild.fronts.delete(drop.id);
        rearBuild.fronts.add(remain.id);
      }
    });
    awaitingBuilds.delete(drop.id);
  };

  /* const prepareBuildOnce = (sources?: Set<FileId>) => {
    const pendingFiles: Set<FileId> = sources
      ? new Set()
      : new Set(files.keys());
    if (sources) {
      // iterate dependencies to collect pending files
      addPendingFiles(sources, pendingFiles);
    }
    return pendingFiles
  } */

  const getPendingFiles = (sources?: Set<FileId>) => {
    const pendingFiles: Set<FileId> = sources
      ? new Set()
      : new Set(files.keys());
    if (sources) {
      // iterate dependencies to collect pending files
      addPendingFiles(sources, pendingFiles);
    }
    return pendingFiles;
  };

  const buildOnce = async (changedSources?: Set<FileId>) => {
    const buildInfo: BuildInfo = {
      id: uuid(),
      fronts: new Set<string>(),
      rears: new Set<string>(),
      files: getPendingFiles(changedSources)
    };
    // 判断是将这个buildOnce放入currentBuildings 还是awaitingBuildings
    for (const [_, runningBuild] of runningBuilds) {
      if (ifIntersect(runningBuild.files, buildInfo.files)) {
        runningBuild.rears.add(buildInfo.id);
        buildInfo.fronts.add(runningBuild.id);
      }
    }
    for (const [_, awaitingBuild] of awaitingBuilds) {
      if (ifIntersect(awaitingBuild.files, buildInfo.files)) {
        // buildInfo will replace existing awaitingBuild
        mergeBuilds(buildInfo, awaitingBuild);
      }
    }
    // this update cannot run immediately
    if (buildInfo.fronts.size) {
      if (!awaitingBuilds.has(buildInfo.id)) {
        awaitingBuilds.set(buildInfo.id, buildInfo);
      }
    } else {
      // this update does not conflict with all currentBuilds, run right away
      runningBuilds.set(buildInfo.id, buildInfo);
      await runBuildOnce(buildInfo);
    }
  };

  const runBuildOnce = async (buildInfo: BuildInfo) => {
    const { fronts } = buildInfo;
    // if its front has not completed, do not run
    if (Array.from(fronts).some(front => runningBuilds.has(front))) {
      return;
    }
    // clear from
    awaitingBuilds.delete(buildInfo.id);
    runningBuilds.set(buildInfo.id, buildInfo);
    const defer = createDefer<any>();
    currentDefer = defer;
    const pendingFiles = buildInfo.files;
    Array.from(onBuildStartHandlers).forEach(handler => {
      handler();
    });
    pendingFiles.forEach(file => {
      runBuildSingleFile(file, pendingFiles, defer);
    });
    // if no pendingFiles, resolve directly
    if (!pendingFiles.size) {
      defer.resolve();
    }
    await defer.promise;
    Array.from(onBuildEndHandlers).forEach(handler => {
      handler();
    });

    // clear from runningBuilds and trigger next buildOnce
    runningBuilds.delete(buildInfo.id);
    // rears should be at awaitingBuilds
    buildInfo.rears.forEach(rear => {
      const rearBuild = awaitingBuilds.get(rear);
      if (rearBuild) {
        runBuildOnce(rearBuild);
      } else {
        // FIXME: should not reach
        console.error('rearBuild not found');
      }
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
    onBuildStartHandlers.clear();
    onBuildEndHandlers.clear();
    dependencyMap.clear();
    runningBuilds.clear();
    awaitingBuilds.clear();
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
