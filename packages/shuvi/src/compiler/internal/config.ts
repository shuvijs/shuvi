import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from "@shuvi/toolpack/lib/webpack/config";
import { App } from "@shuvi/types";
import {
  BUILD_MEDIA_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_WEBPACK,
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
  BUILD_SERVER_APP
} from "../../constants";

export interface WebpackEntry {
  [x: string]: string[];
}

interface WebpackConfigOptions {
  name: string;
  node: boolean;
}

export function createWepbackConfig(app: App, opts: WebpackConfigOptions) {
  const { paths, dev } = app;
  let chain: WebpackChain;

  const srcDirs = [paths.appDir, paths.srcDir];
  if (opts.node) {
    chain = createNodeWebpackChain({
      srcDirs,
      dev,
      projectRoot: paths.projectDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH
    });
    chain.output.path(`${paths.buildDir}/${BUILD_SERVER_DIR}`);
  } else {
    chain = createBrowserWebpackChain({
      srcDirs,
      dev,
      projectRoot: paths.projectDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH,
      publicPath: app.assetPublicPath
    });
    chain.output.path(`${paths.buildDir}/${BUILD_CLIENT_DIR}`);
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  chain.name(opts.name);
  chain.resolve.alias.set("@shuvi/app", app.paths.appDir);
  chain.output.set("filename", ({ chunk }: { chunk: { name: string } }) => {
    // Use `[name]-[contenthash].js` in production
    if (
      !dev &&
      (chunk.name === BUILD_CLIENT_RUNTIME_MAIN ||
        chunk.name === BUILD_CLIENT_RUNTIME_WEBPACK)
    ) {
      return chunk.name.replace(/\.js$/, "-[contenthash].js");
    }

    return "[name]";
  });

  return chain.toConfig();
}

export function getClientEntry(_app: App): WebpackEntry {
  return {
    [BUILD_CLIENT_RUNTIME_MAIN]: [require.resolve("@shuvi/runtime-core/lib/client/index")]
  };
}

export function getServerEntry(_app: App): WebpackEntry {
  return {
    // TODO: ssr only
    [BUILD_SERVER_APP]: ["@shuvi/app/app"]
  };
}
