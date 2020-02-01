"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@shuvi/core/lib/constants");
exports.CLIENT_CONTAINER_ID = '__APP';
exports.CLIENT_APPDATA_ID = '__APP_DATA';
exports.ROUTE_PREFIX = `/_${constants_1.NAME}`;
exports.HOT_MIDDLEWARE_PATH = `${exports.ROUTE_PREFIX}/webpack-hmr`;
exports.HOT_LAUNCH_EDITOR_ENDPOINT = `${exports.ROUTE_PREFIX}/development/open-stack-frame-in-editor`;
