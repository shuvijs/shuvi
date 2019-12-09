import WebpackChain from "webpack-chain";
import { baseWebpackChain, BaseOptions } from "./base";

export interface NodeOptions extends BaseOptions {}

export function createNodeWebpackChain({
  ...baseOptions
}: NodeOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);

  return chain;
}
