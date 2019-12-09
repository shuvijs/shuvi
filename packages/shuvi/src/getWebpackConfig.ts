import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from "@shuvi/toolpack/lib/webpack/config";
import { Shuvi } from "@shuvi/core";

interface Options {
  node: boolean;
}

export function getWebpackConfig(service: Shuvi, opts: Options) {
  const { paths } = service;
  let chain: WebpackChain;
  const isDev = process.env.NODE_ENV === "development";
  if (opts.node) {
    chain = createBrowserWebpackChain({
      dev: isDev,
      projectRoot: paths.projectDir,
      srcDirs: [paths.srcDir],
      mediaOutputPath: "static/media/[name].[hash:8].[ext]"
    });
  } else {
    chain = createNodeWebpackChain({
      dev: isDev,
      projectRoot: paths.projectDir,
      srcDirs: [paths.srcDir],
      mediaOutputPath: "static/media/[name].[hash:8].[ext]"
    });
  }

  chain.output.path(paths.outputDir);

  return chain.toConfig();
}
