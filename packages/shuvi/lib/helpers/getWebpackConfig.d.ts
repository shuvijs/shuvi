/// <reference types="webpack" />
import { AppCore } from "@shuvi/types/core";
interface Options {
    node: boolean;
}
export declare function getWebpackConfig(app: AppCore, opts: Options): import("webpack").Configuration;
export {};
