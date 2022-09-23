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
  const changedFiles: Set<string> = new Set();
  const removedFiles: Set<string> = new Set();

  wp.on('aggregated', () => {
    const knownFiles = wp.getTimeInfoEntries();

    if (!changedFiles.size && !removedFiles.size) {
      return;
    }

    callback({
      changes: Array.from(changedFiles),
      removals: Array.from(removedFiles),
      getAllFiles() {
        const res: string[] = [];
        for (const [file, timeinfo] of knownFiles.entries()) {
          if (timeinfo && timeinfo.accuracy !== undefined) {
            res.push(file);
          }
        }
        return res;
      }
    });

    changedFiles.clear();
    removedFiles.clear();
  });

  wp.on('change', (file, time, explanation) => {
    if (
      ignoreFileContentUpdate &&
      explanation === watchpackExplanationType.change
    ) {
      return;
    }
    changedFiles.add(file);
    callbackUndelayed?.(file, time);
  });

  wp.on('remove', (file, time, explanation) => {
    if (
      ignoreFileContentUpdate &&
      explanation === watchpackExplanationType.change
    ) {
      return;
    }
    removedFiles.add(file);
    callbackUndelayed?.(file, time);
  });

  wp.watch({ files, directories, missing, startTime });

  return () => {
    changedFiles.clear();
    removedFiles.clear();
    wp.close();
  };
}
