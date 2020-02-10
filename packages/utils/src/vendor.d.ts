declare module "watchpack" {
  import { EventEmitter } from "events";

  export interface TimeInfo {
    safeTime: number;
    timestamp: number;
    accuracy?: number;
  }

  class Watchpack extends EventEmitter {
    constructor(options: {
      aggregateTimeout?: number;
      poll?: boolean;
      followSymlinks?: boolean;
      ignored?: string | RegExp | string[];
    });
    watch(options: {
      files?: string[];
      directories?: string[];
      missing?: string[];
      startTime?: number;
    }): void;
    pause(): void;
    close(): void;

    getTimeInfoEntries(): Map<string, TimeInfo>;
  }

  export default Watchpack;
}
