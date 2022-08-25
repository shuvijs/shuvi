import Watchpack, { TimeInfo } from 'watchpack';

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
    startTime = Date.now()
  }: WatchOptions,
  callback: WatchCallback,
  callbackUndelayed?: ChangeCallback
): () => void {
  const watchPackOptions = { ...options };
  if (aggregateTimeout !== undefined) {
    watchPackOptions.aggregateTimeout = aggregateTimeout;
  }
  const wp = new Watchpack(watchPackOptions);
  wp.on('aggregated', (changes: Set<string>, removals: Set<string>) => {
    const knownFiles = wp.getTimeInfoEntries();
    callback({
      changes: Array.from(changes),
      removals: Array.from(removals),
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
  });
  if (callbackUndelayed) {
    wp.on('change', callbackUndelayed);
    wp.on('remove', callbackUndelayed);
  }

  wp.watch({ files, directories, missing, startTime });

  return () => {
    wp.close();
  };
}
