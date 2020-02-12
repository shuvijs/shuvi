"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toString = Object.prototype.toString;
function isRegExp(target) {
    return toString.call(target) === `[object RegExp]`;
}
function isFunction(target) {
    return toString.call(target) === `[object Function]`;
}
function getModuleId(wpModule) {
    // return wpModule.resourceResolveData.path;
    return wpModule.userRequest;
}
const stubLoader = require.resolve("./stub-loader");
const ModuleStatus = {
    PendingReplaced: 1,
    Replaced: 2,
    PendingRestore: 3,
    Restored: 4
};
const knownModules = new Map();
class ModuleReplacePlugin {
    constructor(options) {
        this._options = Object.assign({ modules: [] }, options);
        this._collectModules = this._collectModules.bind(this);
    }
    static restoreModule(id) {
        const moduleInfo = knownModules.get(id);
        if (moduleInfo) {
            console.log("restore module", id);
            moduleInfo.status = ModuleStatus.PendingRestore;
        }
    }
    apply(compiler) {
        compiler.hooks.beforeCompile.tapAsync("ModuleReplacePlugin", ({ normalModuleFactory }, callback) => {
            normalModuleFactory.hooks.afterResolve.tap("ModuleReplacePlugin", this._collectModules);
        });
        compiler.hooks.compilation.tap("ModuleReplacePlugin", compilation => {
            compilation.hooks.buildModule.tap("ModuleReplacePlugin", (wpModule) => {
                const id = getModuleId(wpModule);
                const moduleInfo = knownModules.get(id);
                if (!moduleInfo) {
                    return;
                }
                if (moduleInfo.status === ModuleStatus.Restored) {
                    return;
                }
                if (moduleInfo.status === ModuleStatus.PendingRestore) {
                    wpModule.loaders = moduleInfo.loaders;
                    moduleInfo.status = ModuleStatus.Restored;
                    return;
                }
                if (moduleInfo.status === ModuleStatus.PendingReplaced) {
                    console.log("replace module", wpModule.userRequest);
                    // const stripQuery = wpModule.resource.replace(/\?.*$/, "");
                    // moduleInfo.filename = stripQuery;
                    moduleInfo.loaders = wpModule.loaders;
                    wpModule.loaders = [
                        {
                            loader: stubLoader,
                            options: {
                                module: moduleInfo.replacedModule
                            }
                        }
                    ];
                    moduleInfo.status = ModuleStatus.Replaced;
                }
            });
        });
    }
    _collectModules(wpModule) {
        const id = getModuleId(wpModule);
        if (knownModules.has(id)) {
            return;
        }
        const replacedModule = this._getReplacedModule(wpModule);
        if (replacedModule) {
            knownModules.set(id, {
                status: ModuleStatus.PendingReplaced,
                replacedModule
            });
        }
    }
    _getReplacedModule(wpModule) {
        const { request, dependencies } = wpModule;
        if (dependencies.length <= 0)
            return null;
        const { modules } = this._options;
        for (let index = 0; index < modules.length; index++) {
            const { test, module } = modules[index];
            let shouldReplace = false;
            if (isRegExp(test)) {
                shouldReplace = test.test(request);
            }
            else if (isFunction(test)) {
                shouldReplace = test(request, wpModule);
            }
            if (shouldReplace)
                return module;
        }
        return null;
    }
}
exports.default = ModuleReplacePlugin;
