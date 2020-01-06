"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function getBuildPath(buildDir, path) {
    return path_1.join(buildDir, path);
}
exports.getBuildPath = getBuildPath;
