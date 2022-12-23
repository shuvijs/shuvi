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
  FileOptionWithId,
  FileInternalInstance,
  BuildInfo,
  DependencyInfo,
  FileStatus,
  BuildRunningInfo,
  FileInfo
} from './types';
import { appendChangedFiles } from './helpers';

type OnBuildStartEvent = {};

type OnSingleBuildEndEvent = {
  finished: boolean;
  changedFiles: ReadonlyMap<string, FileInfo>;
};

type OnBuildEndEvent = {
  changedFiles: ReadonlyMap<string, FileInfo>;
};

type OnBuildStartHandler = (event: OnBuildStartEvent) => void;
type OnSingleBuildEndHandler = (event: OnSingleBuildEndEvent) => void;
type OnBuildEndHandler = (event: OnBuildEndEvent) => void;

type EventCanceler = () => void;

export interface FileBuilder<C extends {}> {
  addFile: (...newFileOption: FileOptionWithId<any, C>[]) => void;
  build: (dir?: string) => Promise<void>;
  watch: (dir?: string) => Promise<void>;
  close: () => Promise<void>;
  getContent: <T>(fileOption: FileOptionWithId<T>) => T;
  onBuildStart: (eventHandler: OnBuildStartHandler) => EventCanceler;
  onBuildEnd: (eventHandler: OnBuildEndHandler) => EventCanceler;
  onSingleBuildEnd: (eventHandler: OnSingleBuildEndHandler) => EventCanceler;
  onInvalid: (eventHandler: () => void) => EventCanceler;
  /** check if the file is the dependency of the fileBuilder */
  isDependency: (filePath: string) => boolean;
}

const createInstance = (
  fileOption: FileOptionWithId<any>,
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
  const fileOptions: FileOptionWithId<any>[] = [];
  const dependencyMap = new Map<FileId, DependencyInfo>();
  const watchMap = new Map<FileId, WatchOptions>();
  const watchingFilesMap = new Map<string, FileId>();
  const watcherCancelers: EventCanceler[] = [];
  const files: Map<FileId, FileInternalInstance<any, any>> = new Map();
  let currentDefer: Defer; // mark current defer for closing

  const onBuildStartHandlers = new Set<OnBuildStartHandler>();
  const onBuildEndHandlers = new Set<OnBuildEndHandler>();
  const onSingleBuildEndHandlers = new Set<OnSingleBuildEndHandler>();
  const onInvalidHandlers = new Set<() => void>();

  const addFile = (...newFileOption: FileOptionWithId<any, C>[]) => {
    fileOptions.push(...newFileOption.map(option => ({ ...option })));
  };

  const getFilePathById = (id: string) => files.get(id)?.fullPath;

  const getFileInfoMapWithPathAsKey = (
    files: ReadonlyMap<FileId, FileInfo>
  ) => {
    const newMap = new Map<string, FileInfo>();
    for (const [id, info] of files) {
      const filePath = getFilePathById(id);
      if (filePath) {
        newMap.set(filePath, info);
      }
    }
    return newMap;
  };

  const getFileIdByFileDependencyPath = (
    filePath: string
  ): FileId | undefined => {
    let currentFilePath = filePath;
    while (currentFilePath !== '/' && currentFilePath !== '.') {
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
    fileOptions: FileOptionWithId<any, any>[],
    needWatch: boolean = false
  ) => {
    await Promise.all(
      fileOptions.map(async currentFile => {
        const { id, dependencies, watchOptions } = currentFile;
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

                watchMap.set(id, {
                  directories,
                  files,
                  missing,
                  ignoreFileContentUpdate: watchOptions?.ignoreFileContentUpdate
                });
                watchingFilesMap.set(dependencyFile, id);
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
    pendingBuildRunningInfo: BuildRunningInfo
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
    let anyChanged = false;
    for (const dep of dependencies) {
      const status = pendingBuildRunningInfo.filesStatusMap.get(dep);
      // if status is undefined, this dep is not included in this build.
      if (status) {
        const { updated, changed } = status;
        // This means the dependency has not been rebuild yet, so it should wait
        if (!updated) {
          return {
            shouldExecute: false,
            shouldSkip: false
          };
        }
        if (changed) {
          anyChanged = true;
        }
      }
    }
    return {
      shouldExecute: true,
      shouldSkip: !anyChanged
    };
  };

  const runBuildSingleFile = async (
    id: string,
    buildRunningInfo: BuildRunningInfo,
    defer: Defer
  ) => {
    let { shouldExecute, shouldSkip } = getCurrentConditions(
      id,
      buildRunningInfo
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
    const currentStatus = buildRunningInfo.filesStatusMap.get(id);
    invariant(currentStatus);
    currentStatus.updated = true;
    currentStatus.changed = !shouldSkip;
    if (!shouldSkip) {
      currentStatus.changedTime = Date.now();
    }
    buildRunningInfo.pendingFiles.delete(id);
    if (buildRunningInfo.pendingFiles.size === 0) {
      defer.resolve();
    }
    const dependencyInfo = getDependencyInfoById(id);
    const { dependents } = dependencyInfo;
    dependents.forEach(dep => {
      runBuildSingleFile(dep, buildRunningInfo, defer);
    });
  };

  const runningBuilds = new Map<string, BuildInfo>();
  const awaitingBuilds = new Map<string, BuildInfo>();

  /**
   * drop and its relationship will be merged into remain and remain's
   * only happened with awaiting builds
   */
  const mergeBuilds = (remain: BuildInfo, drop: BuildInfo) => {
    awaitingBuilds.set(remain.id, remain);
    // merge files

    const remainFiles = new Set(remain.files);
    drop.files.forEach(file => {
      remainFiles.add(file);
    });
    remain.files = remainFiles;
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
    const filesStatusMap = new Map<FileId, FileStatus>();
    files.forEach(file => {
      filesStatusMap.set(file, { updated: false, changed: false });
    });
    const collectedChangedFiles = new Map<FileId, FileInfo>();
    const buildInfo: BuildInfo = {
      id: uuid(),
      fronts: new Set<string>(),
      rears: new Set<string>(),
      files,
      collectedChangedFiles
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
    const { fronts, files, collectedChangedFiles } = buildInfo;
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
    files.forEach(file => {
      filesStatusMap.set(file, { updated: false, changed: false });
    });
    const pendingFiles = new Set(files);
    const pendingBuildRunningInfo: BuildRunningInfo = {
      filesStatusMap,
      pendingFiles
    };
    const buildRunningInfo: BuildRunningInfo = {
      filesStatusMap,
      pendingFiles: new Set(files)
    };
    // const pendingBuildRunningInfo =
    buildRunningInfo.pendingFiles.forEach(file => {
      runBuildSingleFile(file, buildRunningInfo, defer);
    });
    // if no pendingFiles, resolve directly
    if (!buildRunningInfo.pendingFiles.size) {
      defer.resolve();
    }
    await defer.promise;

    // collecting changed files
    const changedFiles = new Map<FileId, FileInfo>();
    for (const [file, fileStatus] of pendingBuildRunningInfo.filesStatusMap) {
      const { changed, changedTime } = fileStatus;
      if (changed) {
        invariant(changedTime);
        changedFiles.set(file, { timestamp: changedTime });
        collectedChangedFiles.set(file, { timestamp: changedTime });
      }
    }

    const { rears } = buildInfo;
    const finished = rears.size === 0;
    Array.from(onSingleBuildEndHandlers).forEach(handler => {
      handler({
        finished,
        changedFiles: getFileInfoMapWithPathAsKey(changedFiles)
      });
    });

    if (finished) {
      Array.from(onBuildEndHandlers).forEach(handler => {
        handler({
          changedFiles: getFileInfoMapWithPathAsKey(collectedChangedFiles)
        });
      });
    }

    // clear from runningBuilds and trigger next buildOnce
    runningBuilds.delete(buildInfo.id);
    // rears should be at awaitingBuilds
    rears.forEach(rear => {
      const rearBuild = awaitingBuilds.get(rear);
      invariant(rearBuild);
      appendChangedFiles(rearBuild, collectedChangedFiles);
      runBuildOnce(rearBuild);
    });
  };

  const addWatchers = () => {
    for (const [id, watchOptions] of watchMap) {
      const canceler = createWatcher(
        { ...watchOptions, aggregateTimeout: 0 },
        () => {
          // currently handler has no params
          watcherHandler(id);
        },
        () => {
          Array.from(onInvalidHandlers).forEach(handler => {
            handler();
          });
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
    onSingleBuildEndHandlers.clear();
    dependencyMap.clear();
    runningBuilds.clear();
    awaitingBuilds.clear();
  };
  const getContent = <T>(fileOption: FileOptionWithId<T>) => {
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
  const onSingleBuildEnd = (eventHandler: OnSingleBuildEndHandler) => {
    onSingleBuildEndHandlers.add(eventHandler);
    return () => {
      onSingleBuildEndHandlers.delete(eventHandler);
    };
  };

  const onInvalid = (eventHandler: () => void) => {
    onInvalidHandlers.add(eventHandler);
    return () => {
      onInvalidHandlers.delete(eventHandler);
    };
  };

  const isDependency = (filePath: string) =>
    Boolean(getFileIdByFileDependencyPath(filePath));

  return {
    addFile,
    build,
    watch,
    close,
    getContent,
    onBuildStart,
    onBuildEnd,
    onSingleBuildEnd,
    onInvalid,
    isDependency
  };
};
