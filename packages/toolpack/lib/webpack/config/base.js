"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const webpack_chain_1 = __importDefault(require("webpack-chain"));
exports.WebpackChain = webpack_chain_1.default;
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const webpack_1 = __importDefault(require("webpack"));
const path_1 = __importDefault(require("path"));
const resolve_1 = __importDefault(require("resolve"));
const resolveLoader = (name) => path_1.default.join(__dirname, `../loaders/${name}`);
const resolvePlugin = (name) => path_1.default.join(__dirname, `../plugins/${name}`);
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
function baseWebpackChain({ dev, projectRoot, srcDirs, mediaOutputPath, env = {} }) {
    let typeScriptPath;
    try {
        typeScriptPath = resolve_1.default.sync("typescript", {
            basedir: projectRoot
        });
    }
    catch (_) { }
    const tsConfigPath = path_1.default.join(projectRoot, "tsconfig.json");
    const useTypeScript = Boolean(typeScriptPath && fs_1.default.existsSync(tsConfigPath));
    const config = new webpack_chain_1.default();
    config.mode(dev ? "development" : "production");
    config.performance.hints(false).end();
    config.optimization.merge({
        noEmitOnErrors: dev,
        checkWasmTypes: false,
        nodeEnv: false,
        splitChunks: false,
        runtimeChunk: undefined,
        minimize: !dev
    });
    config.optimization.minimizer("terser").use(terser_webpack_plugin_1.default, [
        {
            parallel: true,
            // cache: "path/to/cache",
            terserOptions
        }
    ]);
    config.output.merge({
        hotUpdateChunkFilename: "static/webpack/[id].[hash].hot-update.js",
        hotUpdateMainFilename: "static/webpack/[hash].hot-update.json",
        // This saves chunks with the name given via `import()`
        chunkFilename: `static/chunks/${dev ? "[name]" : "[name].[contenthash]"}.js`,
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
    config.module.set("strictExportPresence", true);
    config.module
        .rule("src")
        .test(/\.(tsx|ts|js|mjs|jsx)$/)
        .include.merge(srcDirs)
        .end()
        .use("babel-loader")
        .loader(resolveLoader("babel-loader"))
        .options({
        isServer: false,
        // TODO:
        cacheDirectory: false
    });
    config.module
        .rule("media")
        .exclude.merge([/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/])
        .end()
        .use("file-loader")
        .options({
        name: mediaOutputPath
        // name: "static/media/[name].[hash:8].[ext]"
    });
    // @ts-ignore
    config.plugin("chunk-names").use(resolvePlugin("chunk-names-plugin"));
    config
        .plugin("ignore-moment")
        .use(webpack_1.default.IgnorePlugin, [/^\.\/locale$/, /moment$/]);
    config.plugin("define").use(webpack_1.default.DefinePlugin, [
        Object.assign(Object.assign({}, Object.keys(env).reduce((acc, key) => {
            if (/^(?:NODE_.+)|^(?:__.+)$/i.test(key)) {
                throw new Error(`The key "${key}" under "env" is not allowed.`);
            }
            return Object.assign(Object.assign({}, acc), { [`process.env.${key}`]: JSON.stringify(env[key]) });
        }, {})), { "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production") })
    ]);
    if (useTypeScript) {
        config
            .plugin("fork-ts-checker")
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
    return config;
}
exports.baseWebpackChain = baseWebpackChain;
// export function createWebpackConfig(option: Option) {
//   return createWebpackChain(option);
// }
