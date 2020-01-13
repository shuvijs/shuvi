"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const core_1 = require("@shuvi/core");
const resolveSource = (relativePath, ext = "js") => `${path_1.join(__dirname, relativePath)}.${ext}`;
exports.ResourceType = {
    Component: "shuvi_component",
    Entry: "shuvi_entry"
};
exports.ROUTE_PREFIX = `/_${core_1.constants.NAME}`;
exports.DEV_PUBLIC_PATH = `${exports.ROUTE_PREFIX}/static/webpack`;
exports.LAUNCH_EDITOR_ENDPOINT = `${exports.ROUTE_PREFIX}/development/open-stack-frame-in-editor`;
exports.BUILD_MEDIA_PATH = "static/media/[name].[hash:8].[ext]";
exports.BUILD_MANIFEST_PATH = "build-manifest.json";
const BUILD_CLIENT_DIR = "client";
exports.BUILD_CLIENT_RUNTIME_MAIN = `${BUILD_CLIENT_DIR}/runtime/main.js`;
exports.BUILD_CLIENT_RUNTIME_WEBPACK = `${BUILD_CLIENT_DIR}/runtime/webpack.js`;
exports.CLIENT_ENTRY_PATH = resolveSource("client/index");
const BUILD_SERVER_DIR = "server";
exports.BUILD_SERVER_DOCUMENT = `${BUILD_SERVER_DIR}/document.js`;
