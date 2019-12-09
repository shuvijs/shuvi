import WebpackChain from "webpack-chain";
import { BaseOptions } from "./base";
export interface NodeOptions extends BaseOptions {
}
export declare function createNodeWebpackChain({ ...baseOptions }: NodeOptions): WebpackChain;
