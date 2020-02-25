import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from "@shuvi/toolpack/lib/webpack/config";
import { App } from "../../app";
import {
  BUILD_MEDIA_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN,
  BUILD_CLIENT_RUNTIME_WEBPACK,
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
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

const isDev = process.env.NODE_ENV === "development";

export function createWepbackConfig(app: App, opts: WebpackConfigOptions) {
  const { paths } = app;
  let chain: WebpackChain;

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
      publicPath: app.publicUrl
    });
    chain.output.path(`${paths.buildDir}/${BUILD_CLIENT_DIR}`);
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  chain.name(opts.name);
  chain.resolve.alias.set("@shuvi/app", app.paths.appDir);
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

export function getClientEntry(app: App): WebpackEntry {
  return {
    [BUILD_CLIENT_RUNTIME_MAIN]: [app.getClientIndex()]
  };
}

export function getServerEntry(_app: App): WebpackEntry {
  return {
    [BUILD_SERVER_DOCUMENT]: ["@shuvi/app/document"],
    // TODO: ssr only
    [BUILD_SERVER_APP]: ["@shuvi/app/app"]
  };
}
