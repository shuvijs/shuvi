import WebpackChain from "webpack-chain";
import { BaseOptions } from "./base";
export interface BrowserOptions extends BaseOptions {
}
export declare function createBrowserWebpackChain({ ...baseOptions }: BrowserOptions): WebpackChain;
