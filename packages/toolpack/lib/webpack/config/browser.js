"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_manifest_plugin_1 = __importDefault(require("../plugins/build-manifest-plugin"));
const base_1 = require("./base");
function createBrowserWebpackChain(_a) {
    var { buildManifestFilename } = _a, baseOptions = __rest(_a, ["buildManifestFilename"]);
    const chain = base_1.baseWebpackChain(baseOptions);
    chain
        .plugin("private/build-manifest")
        .use(build_manifest_plugin_1.default, [{ filename: buildManifestFilename }]);
    return chain;
}
exports.createBrowserWebpackChain = createBrowserWebpackChain;
