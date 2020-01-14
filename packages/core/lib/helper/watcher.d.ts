import { TimeInfo } from "watchpack";
export interface WatchEvent {
    changes: string[];
    removals: string[];
}
export declare type KnownFiles = Map<string, TimeInfo>;
declare type WatchCallback = (event: WatchEvent) => void;
export declare function watch({ files, directories }: {
    files?: string[];
    directories?: string[];
}, cb: WatchCallback): () => void;
export {};
