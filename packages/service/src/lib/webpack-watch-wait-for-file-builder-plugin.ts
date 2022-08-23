import { ProjectBuilder } from '../project/projectBuilder';

import { createDefer, Defer } from '@shuvi/utils/lib/defer';

import { Compiler, Plugin } from '@shuvi/toolpack/lib/webpack';

type Options = {
  onBuildStart: ProjectBuilder['onBuildStart'];
  onBuildEnd: ProjectBuilder['onBuildEnd'];
  onBuildTriggered: ProjectBuilder['onBuildTriggered'];
  findFilesByDependencies: ProjectBuilder['findFilesByDependencies'];
};

const mergeSets = <T>(remaining: Set<T>, dropped: ReadonlySet<T>) => {
  for (const item of dropped) {
    remaining.add(item);
  }
};

export default class WebpackWatchWaitForFileBuilderPlugin implements Plugin {
  options: Options;
  defer: Defer<Set<string>>;
  constructor(options: Options) {
    this.options = options;
    this.defer = createDefer();
    this.defer.resolve(new Set());
  }
  apply(compiler: Compiler) {
    const { onBuildEnd, onBuildTriggered, findFilesByDependencies } =
      this.options;
    /**
     * watching.suspend will pause the real action in the watcher handler but still collecting changed files.
     * watching.resume will resume its action
     *
     * We make sure onBuildStart is faster than webpack's watcher and make it suspend.
     *
     * And resume when onBuildEnd.
     *
     * In this way, during build of fileBuilder, webpack will not trigger any watchRun event but keep watching changed files.
     */
    onBuildTriggered(() => {
      compiler.watching.suspend();
    });

    const canResume = (
      changedFiles: ReadonlySet<string>,
      timestamp: number
    ) => {
      const fileInfoEntries =
        compiler.watching.watcher?.getInfo?.().fileTimeInfoEntries;
      if (!fileInfoEntries) return false;
      for (const file of changedFiles) {
        const fileInfo = fileInfoEntries.get(file);
        const safeTime: number = (fileInfo as any)?.safeTime || 0;
        if (safeTime < timestamp) {
          return false;
        }
      }
      return true;
    };
    let interval: NodeJS.Timer | undefined;
    let revealTimer: NodeJS.Timer | undefined;
    let collectedChangedFiles = new Set<string>();
    onBuildEnd(({ changedFiles, buildStatus, timestamp }) => {
      // collect changed files
      mergeSets(collectedChangedFiles, changedFiles);

      // check collectedChangedFiles when fulfilled
      if (buildStatus === 'fulfilled') {
        // fileBuilder's files have changed, wait webpack watcher that it also detect these files have changed
        if (collectedChangedFiles.size) {
          if (interval) {
            clearInterval(interval);
          }
          interval = setInterval(() => {
            if (canResume(collectedChangedFiles, timestamp)) {
              collectedChangedFiles.clear();
              compiler.watching.resume();
              clearInterval(interval);
              clearTimeout(revealTimer);
              interval = undefined;
            }
          }, 10);
        } else {
          compiler.watching.resume();
        }
      }
    });

    compiler.hooks.invalid.tap('invalid plugin', () => {
      const modifiedFiles: Set<string> =
        (compiler.watching as any)._collectedChangedFiles || new Set();
      const removedFiles: Set<string> =
        (compiler.watching as any)._collectedRemovedFiles || new Set();
      const targets = findFilesByDependencies(modifiedFiles, removedFiles);
      if (targets.size) {
        compiler.watching.suspend();
      }
    });
  }
}
