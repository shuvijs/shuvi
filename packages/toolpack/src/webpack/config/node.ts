import WebpackChain from "webpack-chain";
import { baseWebpackChain, BaseOptions } from "./base";

export interface NodeOptions extends BaseOptions {}

export function createNodeWebpackChain({
  ...baseOptions
}: NodeOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);

  chain.target("node");
  chain.output
    .libraryTarget("commonjs2")
    .chunkFilename(baseOptions.dev ? "[name]" : "[name].[contenthash].js");

  chain.module
    .rule("src")
    .use("babel-loader")
    .tap(options => ({
      ...options,
      isNode: true
    }));
  return chain;
}
