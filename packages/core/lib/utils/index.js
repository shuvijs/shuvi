"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
function joinPath(...paths) {
    return paths
        .join("/")
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/");
}
exports.joinPath = joinPath;
__export(require("./memoize"));
