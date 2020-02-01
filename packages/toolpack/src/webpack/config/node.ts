import WebpackChain from "webpack-chain";
import { baseWebpackChain, BaseOptions } from "./base";
import { nodeExternals } from "./parts/external";

export interface NodeOptions extends BaseOptions {}

export function createNodeWebpackChain({
  ...baseOptions
}: NodeOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);

  chain.target("node");
  chain.output.libraryTarget("commonjs2");

  chain.externals(nodeExternals({ projectRoot: baseOptions.projectRoot }));
  chain.plugin("private/build-manifest").tap(([options]) => [
    {
      ...options,
      modules: false
    }
  ]);

  chain.module
    .rule("src")
    .use("babel-loader")
    .tap(options => ({
      ...options,
      isNode: true
    }));

  return chain;
}
