/// <reference types="webpack" />
import { AppCore } from "@shuvi/types/core";
export interface WebpackEntry {
    [x: string]: string[];
}
interface WebpackConfigOptions {
    name: string;
    node: boolean;
}
export declare function createWepbackConfig(app: AppCore, opts: WebpackConfigOptions): import("webpack").Configuration;
export declare function getClientEntry(): WebpackEntry;
export declare function getServerEntry(): WebpackEntry;
export {};
