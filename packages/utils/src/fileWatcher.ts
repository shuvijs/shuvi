import Watchpack, { TimeInfo } from 'watchpack';

const watchpackExplanationType = {
  change: 'change',
  rename: 'rename'
};

export { TimeInfo };

export interface WatchEvent {
  changes: string[];
  removals: string[];
  getAllFiles: () => string[];
}

export interface WatchOptions {
  files?: string[];
  directories?: string[];
  missing?: string[];
  aggregateTimeout?: number;
  startTime?: number;
  ignoreFileContentUpdate?: boolean;
}

export type WatchCallback = (event: WatchEvent) => void;

export type ChangeCallback = (file: string, time: number) => void;

const options = {
  // options:
  aggregateTimeout: 300,
  // fire "aggregated" event when after a change for 1000ms no additional change occurred
  // aggregated defaults to undefined, which doesn't fire an "aggregated" event

  ignored: ['**/.git']
  // ignored: "string" - a glob pattern for files or folders that should not be watched
  // ignored: ["string", "string"] - multiple glob patterns that should be ignored
  // ignored: /regexp/ - a regular expression for files or folders that should not be watched
  // All subdirectories are ignored too
};

export function watch(
  {
    files,
    directories,
    missing,
    aggregateTimeout,
    startTime = Date.now(),
    ignoreFileContentUpdate
  }: WatchOptions,
  callback: WatchCallback,
  callbackUndelayed?: ChangeCallback
): () => void {
  const watchPackOptions = { ...options };
  if (aggregateTimeout !== undefined) {
    watchPackOptions.aggregateTimeout = aggregateTimeout;
  }
  const wp = new Watchpack(watchPackOptions);
  let aggregatedChanges: Set<string> = new Set();
  let aggregatedRemovals: Set<string> = new Set();

  wp.on('aggregated', () => {
    if (!aggregatedChanges.size && !aggregatedRemovals.size) {
      return;
    }
    const knownFiles = wp.getTimeInfoEntries();
    const changes = Array.from(aggregatedChanges);
    const removals = Array.from(aggregatedRemovals);
    aggregatedChanges = new Set();
    aggregatedRemovals = new Set();

    callback({
      changes,
      removals,
      getAllFiles() {
        const res: string[] = [];
        for (const [file, timeInfo] of knownFiles.entries()) {
          if (timeInfo && timeInfo.accuracy !== undefined) {
            res.push(file);
          }
        }
        return res;
      }
    });
  });

  wp.on('change', (file, time, explanation) => {
    if (
      ignoreFileContentUpdate &&
      explanation === watchpackExplanationType.change
    ) {
      return;
    }
    aggregatedRemovals.delete(file);
    aggregatedChanges.add(file);
    callbackUndelayed?.(file, time);
  });

  wp.on('remove', (file, time, explanation) => {
    if (
      ignoreFileContentUpdate &&
      explanation === watchpackExplanationType.change
    ) {
      return;
    }
    aggregatedChanges.delete(file);
    aggregatedRemovals.add(file);
    callbackUndelayed?.(file, time);
  });

  wp.watch({ files, directories, missing, startTime });

  return () => {
    aggregatedChanges.clear();
    aggregatedRemovals.clear();
    wp.close();
  };
}
