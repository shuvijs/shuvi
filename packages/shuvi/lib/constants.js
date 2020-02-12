"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./shared/constants");
const paths_1 = require("./helpers/paths");
__export(require("./shared/constants"));
exports.DEV_PUBLIC_PATH = `${constants_1.ROUTE_PREFIX}/static/webpack/`;
exports.BUILD_MANIFEST_PATH = "build-manifest.json";
exports.BUILD_MEDIA_PATH = "static/media/[name].[hash:8].[ext]";
exports.BUILD_CLIENT_DIR = "client";
exports.BUILD_CLIENT_RUNTIME_MAIN = `static/runtime/main.js`;
exports.BUILD_CLIENT_RUNTIME_WEBPACK = `static/runtime/webpack.js`;
exports.CLIENT_ENTRY_PATH = paths_1.resolvePackageFile("lib/client/index");
exports.BUILD_SERVER_DIR = "server";
exports.BUILD_SERVER_DOCUMENT = `document.js`;
exports.BUILD_SERVER_APP = `app.js`;
exports.PAGE_STATIC_REGEXP = new RegExp(`^${exports.DEV_PUBLIC_PATH}static/chunks/(page-\\w+)\\.js`);
