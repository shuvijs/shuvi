import WebpackChain from "webpack-chain";
import { BaseOptions } from "./base";
export interface BrowserOptions extends BaseOptions {
    buildManifestFilename: string;
}
export declare function createBrowserWebpackChain({ buildManifestFilename, ...baseOptions }: BrowserOptions): WebpackChain;
