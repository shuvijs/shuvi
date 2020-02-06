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
  BUILD_SERVER_DIR
} from "../constants";

interface Options {
  node: boolean;
}

export function getWebpackConfig(app: AppCore, opts: Options) {
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
      publicPath: app.config.publicPath
    });
    chain.output.path(`${paths.buildDir}/${BUILD_CLIENT_DIR}`);
    chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK });
  }

  console.log('require.resolve("@babel/runtime/package.json")');
  chain.resolve.alias.set("@shuvi-app", app.paths.appDir);
  chain.resolve.alias.merge({
    "@babel/runtime-corejs2": path.dirname(
      require.resolve("@babel/runtime-corejs2/package.json")
    )
  });
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
