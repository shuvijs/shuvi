"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// common
exports.NAME = "shuvi";
exports.CONFIG_FILE = "shuvi.config.js";
exports.ROUTE_PREFIX = `/_${exports.NAME}`;
// app
exports.CLIENT_CONTAINER_ID = "__APP";
exports.CLIENT_APPDATA_ID = "__APP_DATA";
exports.DEV_STYLE_ANCHOR_ID = "__style";
exports.HOT_MIDDLEWARE_PATH = `${exports.ROUTE_PREFIX}/webpack-hmr`;
exports.HOT_LAUNCH_EDITOR_ENDPOINT = `${exports.ROUTE_PREFIX}/development/open-stack-frame-in-editor`;
