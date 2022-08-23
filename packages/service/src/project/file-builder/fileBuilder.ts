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
  DependencyInfo,
  FileStatus,
  FilesInfo
} from './types';

type BuildStatus = 'pending' | 'fulfilled';

type OnBuildStartEvent = {
  buildStatus: BuildStatus;
};

type OnBuildEndEvent = {
  buildStatus: BuildStatus;
  noChange: boolean;
  changedFiles: ReadonlySet<string>;
  timestamp: number;
};

type OnBuildStartHandler = (event: OnBuildStartEvent) => void;
type OnBuildEndHandler = (event: OnBuildEndEvent) => void;
type EventCanceler = () => void;

export interface FileBuilder<C extends {}> {
  addFile: (...newFileOption: FileOption<any, C>[]) => void;
  build: (dir?: string) => Promise<void>;
  watch: (dir?: string) => Promise<void>;
  close: () => Promise<void>;
  getContent: <T>(fileOption: FileOption<T>) => T;
  onBuildStart: (eventHandler: OnBuildStartHandler) => EventCanceler;
  onBuildEnd: (eventHandler: OnBuildEndHandler) => EventCanceler;
  onBuildTriggered: (eventHandler: () => void) => EventCanceler;
  findFilesByDependencies: (
    changedFiles: Set<string>,
    removedFiles?: Set<string>
  ) => Set<FileId>;
}

const createInstance = (
  fileOption: FileOption<any>,
  rootDir: string
): FileInternalInstance => {
  const instance: FileInternalInstance = {
    ...fileOption
  };
  if (!instance.virtual) {
    invariant(instance.name);
    instance.fullPath = path.resolve(rootDir, instance.name);
  }
  return instance;
};

export const getFileBuilder = <C extends {} = {}>(
  fileContext?: C
): FileBuilder<C> => {
  let rootDir = '/';
  const context = fileContext || {};
  const fileOptions: FileOption<any>[] = [];
  const dependencyMap = new Map<FileId, DependencyInfo>();
  const watchMap = new Map<FileId, WatchOptions>();
  const watchingFilesMap = new Map<string, FileId>();
  const watcherCancelers: EventCanceler[] = [];
  const files: Map<FileId, FileInternalInstance<any, any>> = new Map();
  let currentDefer: Defer; // mark current defer for closing

  const onBuildStartHandlers = new Set<OnBuildStartHandler>();
  const onBuildEndHandlers = new Set<OnBuildEndHandler>();
  const onBuildTriggeredHandlers = new Set<() => void>();

  const addFile = (...newFileOption: FileOption<any, C>[]) => {
    fileOptions.push(...newFileOption.map(option => ({ ...option })));
  };

  const getFileInstanceById = (id: string): FileInternalInstance => {
    const file = files.get(id);
    invariant(file);
    return file;
  };

  const getFileIdByFileDependencyPath = (
    filePath: string
  ): FileId | undefined => {
    let currentFilePath = filePath;
    while (currentFilePath !== '/') {
      if (watchingFilesMap.has(currentFilePath)) {
        return watchingFilesMap.get(currentFilePath);
      }
      currentFilePath = path.dirname(currentFilePath);
    }
    return undefined;
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
        // create instance
        if (!files.get(id)) {
          files.set(id, createInstance(currentFile, rootDir));
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
                  watchingFilesMap.set(dependencyFile, id);
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

  type BuildConditions = {
    shouldExecute: boolean;
    shouldSkip: boolean;
  };
  /**
   * get conditions if it is OK to execute content or to skip
   */
  const getCurrentConditions = (
    id: string,
    pendingFilesInfo: FilesInfo
  ): BuildConditions => {
    const dependencyInfo = getDependencyInfoById(id);
    const { dependencies } = dependencyInfo;

    // if no dependencies, just go to execute
    if (!dependencies.size) {
      return {
        shouldExecute: true,
        shouldSkip: false
      };
    }
    let allNoChange = true;
    for (const dep of dependencies) {
      const status = pendingFilesInfo.filesStatusMap.get(dep);
      // if status is undefined, this dep is not included in this build.
      if (status) {
        const { updated, noChange } = status;
        if (!updated) {
          return {
            shouldExecute: false,
            shouldSkip: false
          };
        }
        if (!noChange) {
          allNoChange = false;
        }
      }
    }
    return {
      shouldExecute: true,
      shouldSkip: allNoChange
    };
  };

  const runBuildSingleFile = async (
    id: string,
    pendingFilesInfo: FilesInfo,
    defer: Defer
  ) => {
    let { shouldExecute, shouldSkip } = getCurrentConditions(
      id,
      pendingFilesInfo
    );
    if (!shouldExecute) {
      return;
    }
    if (!shouldSkip) {
      const current = files.get(id);
      invariant(current);
      const fileContent = await current.content(context, current.fileContent);
      if (fileContent === current.fileContent) {
        shouldSkip = true;
      } else {
        current.fileContent = fileContent;
      }
      if (current.fullPath) {
        const dir = path.dirname(current.fullPath);
        fs.ensureDirSync(dir);
        fs.writeFileSync(current.fullPath, fileContent, 'utf-8');
      }
    }
    const currentStatus = pendingFilesInfo.filesStatusMap.get(id);
    invariant(currentStatus);
    currentStatus.updated = true;
    currentStatus.noChange = shouldSkip;
    pendingFilesInfo.pendingFiles.delete(id);
    if (pendingFilesInfo.pendingFiles.size === 0) {
      defer.resolve();
    }
    const dependencyInfo = getDependencyInfoById(id);
    const { dependents } = dependencyInfo;
    dependents.forEach(dep => {
      runBuildSingleFile(dep, pendingFilesInfo, defer);
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

    const remainFiles = new Set(remain.files);
    drop.files.forEach(file => {
      remainFiles.add(file);
    });
    remain.files = remainFiles;
    remain.pendingFiles = remainFiles;
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
    const pendingFiles = getPendingFiles(changedSources);
    const files = new Set(pendingFiles);
    const buildInfo: BuildInfo = {
      id: uuid(),
      fronts: new Set<string>(),
      rears: new Set<string>(),
      files,
      pendingFiles
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
    // clear from awaitingBuilds
    awaitingBuilds.delete(buildInfo.id);
    runningBuilds.set(buildInfo.id, buildInfo);
    const defer = createDefer<any>();
    currentDefer = defer;
    Array.from(onBuildStartHandlers).forEach(handler => {
      handler({ buildStatus: 'pending' });
    });
    const filesStatusMap = new Map<FileId, FileStatus>();
    buildInfo.files.forEach(file => {
      filesStatusMap.set(file, { updated: false });
    });
    const pendingFilesInfo: FilesInfo = {
      filesStatusMap,
      pendingFiles: buildInfo.pendingFiles
    };
    // const pendingFilesInfo =
    pendingFilesInfo.pendingFiles.forEach(file => {
      runBuildSingleFile(file, pendingFilesInfo, defer);
    });
    // if no pendingFiles, resolve directly
    if (!pendingFilesInfo.pendingFiles.size) {
      defer.resolve();
    }
    await defer.promise;
    const changedFiles = new Set<string>();
    for (const [id, fileStatus] of pendingFilesInfo.filesStatusMap) {
      // console.log('onBuildEnd summary', id, fileStatus.noChange)
      if (!fileStatus.noChange) {
        const instance = getFileInstanceById(id);
        if (instance.fullPath) {
          changedFiles.add(instance.fullPath);
        }
      }
    }

    const rears = buildInfo.rears;
    const buildStatus = rears.size > 0 ? 'pending' : 'fulfilled';
    const timestamp = Date.now();
    Array.from(onBuildEndHandlers).forEach(handler => {
      handler({
        buildStatus,
        changedFiles,
        noChange: changedFiles.size === 0,
        timestamp
      });
    });

    // clear from runningBuilds and trigger next buildOnce
    runningBuilds.delete(buildInfo.id);
    // rears should be at awaitingBuilds
    rears.forEach(rear => {
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
      const canceler = createWatcher(
        { ...watchOptions, aggregateTimeout: 0 },
        () => {
          // currently handler has no params
          watcherHandler(id);
        }
      );
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
      const { fullPath } = instance;
      if (fullPath) {
        fs.unlinkSync(fullPath);
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
  const onBuildStart = (eventHandler: OnBuildStartHandler) => {
    onBuildStartHandlers.add(eventHandler);
    return () => {
      onBuildStartHandlers.delete(eventHandler);
    };
  };
  const onBuildEnd = (eventHandler: OnBuildEndHandler) => {
    onBuildEndHandlers.add(eventHandler);
    return () => {
      onBuildEndHandlers.delete(eventHandler);
    };
  };

  const onBuildTriggered = (eventHandler: () => void) => {
    onBuildTriggeredHandlers.add(eventHandler);
    return () => {
      onBuildTriggeredHandlers.delete(eventHandler);
    };
  };

  const findFilesByDependencies = (
    changedFiles: Set<string>,
    removedFiles?: Set<string>
  ) => {
    const targets = new Set<FileId>();
    changedFiles.forEach(file => {
      const target = getFileIdByFileDependencyPath(file);
      if (target) {
        targets.add(target);
      }
    });
    if (removedFiles) {
      removedFiles.forEach(file => {
        const target = getFileIdByFileDependencyPath(file);
        if (target) {
          targets.add(target);
        }
      });
    }
    return targets;
  };

  return {
    addFile,
    build,
    watch,
    close,
    getContent,
    onBuildStart,
    onBuildEnd,
    onBuildTriggered,
    findFilesByDependencies
  };
};
