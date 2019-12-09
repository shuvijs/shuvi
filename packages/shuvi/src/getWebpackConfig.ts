import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from "@shuvi/toolpack/lib/webpack/config";
import { Shuvi } from "@shuvi/core";
import { BUILD_MEDIA_PATH, BUILD_MANIFEST_PATH } from "./constants";

interface Options {
  node: boolean;
}

export function getWebpackConfig(service: Shuvi, opts: Options) {
  const { paths } = service;
  let chain: WebpackChain;
  const isDev = process.env.NODE_ENV === "development";
  if (opts.node) {
    chain = createNodeWebpackChain({
      dev: isDev,
      projectRoot: paths.projectDir,
      srcDirs: [paths.srcDir],
      mediaOutputPath: BUILD_MEDIA_PATH
    });
  } else {
    chain = createBrowserWebpackChain({
      dev: isDev,
      projectRoot: paths.projectDir,
      srcDirs: [paths.srcDir],
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaOutputPath: BUILD_MEDIA_PATH
    });
  }

  chain.output.path(paths.outputDir);

  return chain.toConfig();
}
