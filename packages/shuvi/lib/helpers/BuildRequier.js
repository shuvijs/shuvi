"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const constants_1 = require("../constants");
class BuildRequire {
    constructor(options) {
        this._options = options;
    }
    requireDocument() {
        return this._requireDefault(this._resolveServerModule(constants_1.BUILD_SERVER_DOCUMENT));
    }
    requireApp() {
        return this._requireDefault(this._resolveServerModule(constants_1.BUILD_SERVER_APP));
    }
    getEntryAssets(name) {
        const manifest = this._getClientManifest();
        return manifest.entries[name];
    }
    _resolveServerModule(name) {
        const manifest = this._getServerManifest();
        return path_1.default.join(this._options.buildDir, constants_1.BUILD_SERVER_DIR, manifest.chunks[name]);
    }
    _requireDefault(modulePath) {
        const mod = require(modulePath);
        return mod.default || mod;
    }
    _getServerManifest() {
        return this._getManifest(constants_1.BUILD_SERVER_DIR);
    }
    _getClientManifest() {
        return this._getManifest(constants_1.BUILD_CLIENT_DIR);
    }
    _getManifest(dir) {
        return require(path_1.default.join(this._options.buildDir, dir, constants_1.BUILD_MANIFEST_PATH));
    }
}
exports.default = BuildRequire;
