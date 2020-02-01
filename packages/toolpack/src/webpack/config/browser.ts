import webpack from "webpack";
import WebpackChain from "webpack-chain";
// import BuildManifestPlugin from "../plugins/build-manifest-plugin";
import { baseWebpackChain, BaseOptions } from "./base";

export interface BrowserOptions extends BaseOptions {}

export function createBrowserWebpackChain({
  ...baseOptions
}: BrowserOptions): WebpackChain {
  const chain = baseWebpackChain(baseOptions);

  chain.target("web");
  if (baseOptions.dev) {
    chain.plugin("private/hmr-plugin").use(webpack.HotModuleReplacementPlugin);
  }
  chain.plugin("private/build-manifest").tap(([options]) => [
    {
      ...options,
      modules: true
    }
  ]);
  return chain;
}
