import path from "path";
import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from "@shuvi/toolpack/lib/webpack/config";
import { AppCore } from "@shuvi/types/core";
import {
  BUILD_MEDIA_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_WEBPACK,
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
  CLIENT_ENTRY_PATH,
  BUILD_SERVER_DOCUMENT,
  BUILD_SERVER_APP
} from "../../constants";

export interface WebpackEntry {
  [x: string]: string[];
}

interface WebpackConfigOptions {
  name: string;
  node: boolean;
}

export function createWepbackConfig(app: AppCore, opts: WebpackConfigOptions) {
  const { paths } = app;
  let chain: WebpackChain;
  const isDev = process.env.NODE_ENV === "development";

  const srcDirs = [paths.appDir, paths.srcDir];
  if (opts.node) {
    chain = createNodeWebpackChain({
      srcDirs,
      dev: isDev,
      projectRoot: paths.projectDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH
    });
    chain.output.path(`${paths.buildDir}/${BUILD_SERVER_DIR}`);
  } else {
    chain = createBrowserWebpackChain({
      srcDirs,
      dev: isDev,
      projectRoot: paths.projectDir,
      buildManifestFilename: BUILD_MANIFEST_PATH,
      mediaFilename: BUILD_MEDIA_PATH,
      publicPath: app.config.publicUrl
    });
    chain.output.path(`${paths.buildDir}/${BUILD_CLIENT_DIR}`);
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  chain.name(opts.name)
  chain.resolve.alias.set("@shuvi-app", app.paths.appDir);
  chain.output.set("filename", ({ chunk }: { chunk: { name: string } }) => {
    // Use `[name]-[contenthash].js` in production
    if (
      !isDev &&
      (chunk.name === BUILD_CLIENT_RUNTIME_MAIN ||
        chunk.name === BUILD_CLIENT_RUNTIME_WEBPACK)
    ) {
      return chunk.name.replace(/\.js$/, "-[contenthash].js");
    }

    return "[name]";
  });

  return chain.toConfig();
}

export function getClientEntry(): WebpackEntry {
  return {
    [BUILD_CLIENT_RUNTIME_MAIN]: [CLIENT_ENTRY_PATH]
  };
}

export function getServerEntry(): WebpackEntry {
  return {
    [BUILD_SERVER_DOCUMENT]: ["@shuvi-app/document"],
    // TODO: ssr only
    [BUILD_SERVER_APP]: ["@shuvi-app/app"]
  };
}
