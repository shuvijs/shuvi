"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const webpack_sources_1 = require("webpack-sources");
const defaultOptions = {
    filename: "build-manifest.json",
    modules: false
};
function getModules(compiler, compilation) {
    let context = compiler.options.context;
    let manifest = {};
    compilation.chunkGroups.forEach(chunkGroup => {
        if (chunkGroup.isInitial()) {
            return;
        }
        chunkGroup.origins.forEach((chunkGroupOrigin) => {
            const { request } = chunkGroupOrigin;
            chunkGroup.chunks.forEach((chunk) => {
                chunk.files.forEach((file) => {
                    if (!file.match(/\.js$/) || !file.match(/^static\/chunks\//)) {
                        return;
                    }
                    let publicPath = url_1.default.resolve(compilation.outputOptions.publicPath || "", file);
                    for (const module of chunk.modulesIterable) {
                        let id = module.id;
                        let name = typeof module.libIdent === "function"
                            ? module.libIdent({ context })
                            : null;
                        if (!manifest[request]) {
                            manifest[request] = [];
                        }
                        // Avoid duplicate files
                        if (manifest[request].some(item => item.id === id && item.file === file)) {
                            continue;
                        }
                        manifest[request].push({
                            id,
                            name,
                            file,
                            publicPath
                        });
                    }
                });
            });
        });
    });
    manifest = Object.keys(manifest)
        .sort()
        // eslint-disable-next-line no-sequences
        .reduce((a, c) => ((a[c] = manifest[c]), a), {});
    return manifest;
}
// This plugin creates a build-manifest.json for all assets that are being output
// It has a mapping of "entry" filename to real filename. Because the real filename can be hashed in production
class BuildManifestPlugin {
    constructor(options = {}) {
        this._options = Object.assign(Object.assign({}, defaultOptions), options);
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync("BuildManifest", (compilation, callback) => {
            const assetMap = {
                entries: {},
                chunks: {},
                modules: {}
            };
            if (this._options.modules) {
                assetMap.modules = getModules(compiler, compilation);
            }
            // compilation.entrypoints is a Map object, so iterating over it 0 is the key and 1 is the value
            for (const [, entrypoint] of compilation.entrypoints.entries()) {
                const filesForEntry = [];
                for (const chunk of entrypoint.chunks) {
                    // If there's no name or no files
                    if (!chunk.name || !chunk.files) {
                        continue;
                    }
                    for (const file of chunk.files) {
                        if (/\.map$/.test(file) || /\.hot-update\.js$/.test(file)) {
                            continue;
                        }
                        // Only `.js` and `.css` files are added for now. In the future we can also handle other file types.
                        if (!/\.js$/.test(file) && !/\.css$/.test(file)) {
                            continue;
                        }
                        filesForEntry.push(file.replace(/\\/g, "/"));
                    }
                }
                assetMap.entries[entrypoint.name] = [...filesForEntry];
            }
            let files = [];
            for (let index = 0; index < compilation.chunks.length; index++) {
                const chunk = compilation.chunks[index];
                const chunkFiles = chunk.files;
                for (let index = 0; index < chunkFiles.length; index++) {
                    const filepath = chunkFiles[index];
                    const name = chunk.name ? chunk.name : filepath;
                    files.push({
                        filepath: filepath,
                        chunk: chunk,
                        name: name,
                        isInitial: chunk.isOnlyInitial(),
                        isChunk: true,
                        isAsset: false,
                        isModuleAsset: false
                    });
                }
            }
            files = files.filter(function (file) {
                // Don't add hot updates to manifest
                const isUpdateChunk = /\.hot-update\.js$/.test(file.filepath);
                return !isUpdateChunk;
            });
            files.forEach(file => {
                assetMap.chunks[file.name] = file.filepath;
            });
            compilation.assets[this._options.filename] = new webpack_sources_1.RawSource(JSON.stringify(assetMap, null, 2));
            callback();
        });
    }
}
exports.default = BuildManifestPlugin;
