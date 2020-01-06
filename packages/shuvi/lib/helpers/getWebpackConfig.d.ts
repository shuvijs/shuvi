/// <reference types="webpack" />
import { Application } from "@shuvi/core";
interface Options {
    node: boolean;
}
export declare function getWebpackConfig(app: Application, opts: Options): import("webpack").Configuration;
export {};
