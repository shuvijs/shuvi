import WebpackChain from "webpack-chain";
import { baseWebpackChain, BaseOptions } from "./base";

export interface BrowserOptions extends BaseOptions {}

export function createBrowserWebpackChain({
  ...baseOptions
}: BrowserOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);

  return chain;
}
