import WebpackChain from "webpack-chain";
import { baseWebpackChain, BaseOptions } from "./base";
import { nodeExternals } from "./parts/external";
import { withStyle } from "./parts/style";

export interface NodeOptions extends BaseOptions {}

export function createNodeWebpackChain({
  ...baseOptions
}: NodeOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);

  chain.target("node");
  chain.devtool(false);
  chain.output.libraryTarget("commonjs2");
  chain.optimization.minimize(false);
  chain.externals(nodeExternals({ projectRoot: baseOptions.projectRoot }));

  chain.module
    .rule("main")
    .oneOf("js")
    .use("babel-loader")
    .tap(options => ({
      ...options,
      isNode: true
    }));

  chain.plugin("private/build-manifest").tap(([options]) => [
    {
      ...options,
      modules: false
    }
  ]);

  return withStyle(chain, { remove: true });
}
