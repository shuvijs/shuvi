"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@shuvi/toolpack/lib/webpack/config");
const constants_1 = require("../constants");
function getWebpackConfig(app, opts) {
    const { paths } = app;
    let chain;
    const isDev = process.env.NODE_ENV === "development";
    if (opts.node) {
        chain = config_1.createNodeWebpackChain({
            dev: isDev,
            projectRoot: paths.projectDir,
            srcDirs: [paths.srcDir],
            buildManifestFilename: constants_1.BUILD_MANIFEST_PATH,
            mediaFilename: constants_1.BUILD_MEDIA_PATH
        });
        chain.output.path(`${paths.buildDir}/${constants_1.BUILD_SERVER_DIR}`);
    }
    else {
        chain = config_1.createBrowserWebpackChain({
            dev: isDev,
            projectRoot: paths.projectDir,
            srcDirs: [paths.srcDir],
            buildManifestFilename: constants_1.BUILD_MANIFEST_PATH,
            mediaFilename: constants_1.BUILD_MEDIA_PATH,
            publicPath: app.config.publicPath
        });
        chain.output.path(`${paths.buildDir}/${constants_1.BUILD_CLIENT_DIR}`);
        chain.optimization.runtimeChunk({ name: constants_1.BUILD_CLIENT_RUNTIME_WEBPACK });
    }
    chain.resolve.alias.set("@shuvi-app", app.paths.appDir);
    chain.output.set("filename", ({ chunk }) => {
        // Use `[name]-[contenthash].js` in production
        if (!isDev &&
            (chunk.name === constants_1.BUILD_CLIENT_RUNTIME_MAIN ||
                chunk.name === constants_1.BUILD_CLIENT_RUNTIME_WEBPACK)) {
            return chunk.name.replace(/\.js$/, "-[contenthash].js");
        }
        return "[name]";
    });
    return chain.toConfig();
}
exports.getWebpackConfig = getWebpackConfig;
