import WebpackChain from "webpack-chain";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import path from "path";
import ChunkNamesPlugin from "../plugins/chunk-names-plugin";
import BuildManifestPlugin from "../plugins/build-manifest-plugin";
import ModuleReplacePlugin from "../plugins/module-replace-plugin";
import RequireCacheHotReloaderPlugin from "../plugins/require-cache-hot-reloader-plugin";
import { getProjectInfo } from "../../utils/typeScript";

const dumpRouteComponent = require.resolve("../../utils/emptyComponent");

const resolveLocalLoader = (name: string) =>
  path.join(__dirname, `../loaders/${name}`);
// const resolvePlugin = (name: string) =>
//   path.join(__dirname, `../plugins/${name}`);

export interface BaseOptions {
  dev: boolean;
  projectRoot: string;
  srcDirs: string[];
  mediaFilename: string;
  buildManifestFilename: string;
  publicPath?: string;
  env?: {
    [x: string]: string;
  };
}

const terserOptions = {
  parse: {
    ecma: 8
  },
  compress: {
    ecma: 5,
    warnings: false,
    // The following two options are known to break valid JavaScript code
    comparisons: false,
    inline: 2 // https://github.com/zeit/next.js/issues/7178#issuecomment-493048965
  },
  mangle: { safari10: true },
  output: {
    ecma: 5,
    safari10: true,
    comments: false,
    // Fixes usage of Emoji and certain Regex
    ascii_only: true
  }
};

export { WebpackChain };

export function baseWebpackChain({
  dev,
  projectRoot,
  srcDirs,
  mediaFilename,
  buildManifestFilename,
  publicPath = "/",
  env = {}
}: BaseOptions): WebpackChain {
  const { typeScriptPath, tsConfigPath, useTypeScript } = getProjectInfo(
    projectRoot
  );
  const config = new WebpackChain();

  config.mode(dev ? "development" : "production");
  config.performance.hints(false).end();

  config.optimization.merge({
    noEmitOnErrors: dev,
    checkWasmTypes: false,
    nodeEnv: false,
    splitChunks: false,
    runtimeChunk: undefined,
    moduleIds: dev ? "named" : "deterministic",
    minimize: !dev
  });
  config.optimization.minimizer("terser").use(TerserPlugin, [
    {
      parallel: true,
      // cache: "path/to/cache",
      terserOptions
    }
  ]);

  config.output.merge({
    publicPath,
    hotUpdateChunkFilename: "static/webpack/[id].[hash].hot-update.js",
    hotUpdateMainFilename: "static/webpack/[hash].hot-update.json",
    // This saves chunks with the name given via `import()`
    chunkFilename: `static/chunks/${
      dev ? "[name]" : "[name].[contenthash]"
    }.js`,
    strictModuleExceptionHandling: true,
    // crossOriginLoading: crossOrigin,
    futureEmitAssets: !dev,
    webassemblyModuleFilename: "static/wasm/[modulehash].wasm"
  });

  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || "")
    .split(process.platform === "win32" ? ";" : ":")
    .filter(p => !!p);

  config.resolve.merge({
    modules: [
      "node_modules",
      ...nodePathList // Support for NODE_PATH environment variable
    ],
    alias: {
      // todo:
      // These aliases make sure the wrapper module is not included in the bundles
      // Which makes bundles slightly smaller, but also skips parsing a module that we know will result in this alias
    }
  });

  config.resolveLoader.merge({
    alias: ["babel-loader", "route-component-loader"].reduce(
      (alias, loader) => {
        alias[`@shuvi/${loader}`] = resolveLocalLoader(loader);
        return alias;
      },
      {} as Record<string, string>
    )
  });

  config.module.set("strictExportPresence", true);
  config.module
    .rule("src")
    .test(/\.(tsx|ts|js|mjs|jsx)$/)
    .include.merge(srcDirs)
    .end()
    .use("babel-loader")
    .loader("@shuvi/babel-loader")
    .options({
      isNode: false,
      // TODO:
      cacheDirectory: false
    });
  config.module
    .rule("media")
    .exclude.merge([/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/])
    .end()
    .use("file-loader")
    .loader(require.resolve("file-loader"))
    .options({
      name: mediaFilename
    });

  // @ts-ignore
  config.plugin("private/chunk-names-plugin").use(ChunkNamesPlugin);
  config
    .plugin("private/ignore-plugin")
    .use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/]);
  config.plugin("define").use(webpack.DefinePlugin, [
    {
      ...Object.keys(env).reduce((acc, key) => {
        if (/^(?:NODE_.+)|^(?:__.+)$/i.test(key)) {
          throw new Error(`The key "${key}" under "env" is not allowed.`);
        }

        return {
          ...acc,
          [`process.env.${key}`]: JSON.stringify(env[key])
        };
      }, {}),
      "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production")
    }
  ]);
  config
    .plugin("private/build-manifest")
    .use(BuildManifestPlugin, [{ filename: buildManifestFilename }]);

  if (useTypeScript) {
    config
      .plugin("private/fork-ts-checker-webpack-plugin")
      // @ts-ignore
      .use(require.resolve("fork-ts-checker-webpack-plugin"), [
        {
          typescript: typeScriptPath,
          async: dev,
          useTypescriptIncrementalApi: true,
          checkSyntacticErrors: true,
          tsconfig: tsConfigPath,
          reportFiles: ["**", "!**/__tests__/**", "!**/?(*.)(spec|test).*"],
          compilerOptions: { isolatedModules: true, noEmit: true },
          silent: true,
          formatter: "codeframe"
        }
      ]);
  }

  if (dev) {
    config.plugin("private/module-replace-plugin").use(ModuleReplacePlugin, [
      {
        modules: [
          {
            test: /\?__shuvi-route/,
            module: dumpRouteComponent
          }
        ]
      }
    ]);
    // Even though require.cache is server only we have to clear assets from both compilations
    // This is because the client compilation generates the build manifest that's used on the server side
    config
      .plugin("private/require-cache-hot-reloader")
      .use(RequireCacheHotReloaderPlugin);
  }

  return config;
}

// export function createWebpackConfig(option: Option) {
//   return createWebpackChain(option);
// }
