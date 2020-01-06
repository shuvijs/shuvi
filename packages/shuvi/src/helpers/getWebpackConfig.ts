import {
  WebpackChain,
  createBrowserWebpackChain,
  createNodeWebpackChain
} from "@shuvi/toolpack/lib/webpack/config";
import { Application } from "@shuvi/core";
import {
  BUILD_MEDIA_PATH,
  BUILD_MANIFEST_PATH,
  BUILD_CLIENT_RUNTIME_MAIN_PATH,
  BUILD_CLIENT_RUNTIME_WEBPACK_PATH,
} from "../constants";

interface Options {
  node: boolean;
}

export function getWebpackConfig(app: Application, opts: Options) {
  const { paths } = app;
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
      mediaOutputPath: BUILD_MEDIA_PATH,
      publicPath: app.config.publicPath
    });
  }

  chain.resolve.alias.set("@shuvi-app", app.paths.appDir);

  chain.output.path(paths.buildDir);
  chain.output.set("filename", ({ chunk }: { chunk: { name: string } }) => {
    // Use `[name]-[contenthash].js` in production
    if (
      !isDev &&
      (chunk.name === BUILD_CLIENT_RUNTIME_MAIN_PATH ||
        chunk.name === BUILD_CLIENT_RUNTIME_WEBPACK_PATH)
    ) {
      return chunk.name.replace(/\.js$/, "-[contenthash].js");
    }

    return "[name]";
  });
  chain.optimization.runtimeChunk({ name: BUILD_CLIENT_RUNTIME_WEBPACK_PATH });

  return chain.toConfig();
}
