import { TimeInfo } from "watchpack";
export interface WatchEvent {
    changes: string[];
    removals: string[];
}
export declare type KnownFiles = Map<string, TimeInfo>;
export interface WatchOptions {
    files?: string[];
    directories?: string[];
}
export declare type WatchCallback = (event: WatchEvent) => void;
export declare function watch({ files, directories }: WatchOptions, cb: WatchCallback): () => void;
