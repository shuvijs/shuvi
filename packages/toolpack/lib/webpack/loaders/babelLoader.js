"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const babel_loader_1 = __importDefault(require("babel-loader"));
const path_1 = __importDefault(require("path"));
const preset_1 = __importDefault(require("../../babel/preset"));
const env = process.env.NODE_ENV;
const isDevelopment = env === "development";
const isProduction = env === "production";
function getCacheIdentifier(environment, runtime, packages) {
    environment = environment == null ? "" : environment.toString();
    let cacheIdentifier = `${environment}-${runtime}`;
    for (const packageName of packages) {
        cacheIdentifier += `:${packageName}@`;
        try {
            cacheIdentifier += require(`${packageName}/package.json`).version;
        }
        catch (_) {
            // ignored
        }
    }
    return cacheIdentifier;
}
module.exports = babel_loader_1.default.custom((babel) => {
    const presetItem = babel.createConfigItem(preset_1.default, {
        type: "preset"
    });
    const configs = new Set();
    return {
        customOptions(opts) {
            const custom = {
                isNode: opts.isNode
            };
            const loader = Object.assign(opts.cacheDirectory
                ? {
                    cacheCompression: false,
                    cacheDirectory: path_1.default.join(opts.cacheDirectory, "babel-loader"),
                    cacheIdentifier: getCacheIdentifier(isProduction ? "production" : isDevelopment && "development", opts.isNode ? "server" : "client", ["@shuvi/toolpack"])
                }
                : {
                    cacheDirectory: false
                }, opts);
            delete loader.isNode;
            delete loader.cacheDirectory;
            return { loader, custom };
        },
        config(cfg, { source, customOptions: { isNode } }) {
            const options = Object.assign({}, cfg.options);
            if (cfg.hasFilesystemConfig()) {
                for (const file of [cfg.babelrc, cfg.config]) {
                    // We only log for client compilation otherwise there will be double output
                    if (file && !isNode && !configs.has(file)) {
                        configs.add(file);
                        console.log(`> Using external babel configuration`);
                        console.log(`> Location: "${file}"`);
                    }
                }
            }
            else {
                // Add our default preset if the no "babelrc" found.
                options.presets = [...options.presets, presetItem];
            }
            // pass option to babel-preset
            options.caller.isNode = isNode;
            options.plugins = options.plugins || [];
            return options;
        }
    };
});
