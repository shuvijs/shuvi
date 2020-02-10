import Watchpack, { TimeInfo } from "watchpack";

export interface WatchEvent {
  changes: string[];
  removals: string[];
  // getAllFiles: () => KnownFiles;
}

export type KnownFiles = Map<string, TimeInfo>;

export interface WatchOptions {
  files?: string[];
  directories?: string[];
}

export type WatchCallback = (event: WatchEvent) => void;

const options = {
  // options:
  aggregateTimeout: 300,
  // fire "aggregated" event when after a change for 1000ms no additional change occurred
  // aggregated defaults to undefined, which doesn't fire an "aggregated" event

  ignored: ["**/.git"]
  // ignored: "string" - a glob pattern for files or folders that should not be watched
  // ignored: ["string", "string"] - multiple glob patterns that should be ignored
  // ignored: /regexp/ - a regular expression for files or folders that should not be watched
  // All subdirectories are ignored too
};

export function watch(
  { files, directories }: WatchOptions,
  cb: WatchCallback
): () => void {
  const wp = new Watchpack(options);
  wp.on("aggregated", (changes: Set<string>, removals: Set<string>) => {
    // const knownFiles = wp.getTimeInfoEntries();
    cb({
      changes: Array.from(changes),
      removals: Array.from(removals)
      // getAllFiles() {
      //   const map: KnownFiles = new Map();
      //   for (const [file, timeinfo] of knownFiles.entries()) {
      //     if (timeinfo && timeinfo.accuracy !== undefined) {
      //       map.set(file, timeinfo);
      //     }
      //   }

      //   return map;
      // }
    });
  });
  wp.watch({ files, directories });

  return () => {
    wp.close();
  };
}
