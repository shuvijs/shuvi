import { TimeInfo } from "watchpack";
export { TimeInfo };
export interface WatchEvent {
    changes: string[];
    removals: string[];
    getAllFiles: () => string[];
}
export interface WatchOptions {
    files?: string[];
    directories?: string[];
}
export declare type WatchCallback = (event: WatchEvent) => void;
export declare function watch({ files, directories }: WatchOptions, cb: WatchCallback): () => void;
