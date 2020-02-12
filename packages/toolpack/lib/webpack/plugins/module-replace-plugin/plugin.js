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
    REPLACED: 1,
    ORIGINAL: 2
};
const knownModules = new Map();
class ModuleReplacePlugin {
    constructor(options) {
        this._options = Object.assign({ modules: [] }, options);
    }
    static restoreModule(id) {
        const moduleInfo = knownModules.get(id);
        if (moduleInfo) {
            moduleInfo.status = ModuleStatus.ORIGINAL;
            moduleInfo.compilers.forEach(compiler => compiler.hooks.invalid.call("noop", new Date()));
        }
    }
    apply(compiler) {
        compiler.hooks.beforeCompile.tapAsync("ModuleReplacePlugin", ({ normalModuleFactory }, callback) => {
            normalModuleFactory.hooks.afterResolve.tap("ModuleReplacePlugin", (wpModule) => this._collectModules(compiler, wpModule));
            callback();
        });
        compiler.hooks.compilation.tap("ModuleReplacePlugin", compilation => {
            compilation.hooks.buildModule.tap("ModuleReplacePlugin", wpModule => this._handleBuildModule(compiler, wpModule));
        });
    }
    _handleBuildModule(compiler, wpModule) {
        // const filename = wpModule.resource
        //   ? wpModule.resource.replace(/\?.*$/, "")
        //   : "";
        // if (
        //   filename === "/Users/lixi/Workspace/github/shuvi-test/src/pages/index.js"
        // ) {
        //   console.log("handleBuildModule", wpModule)
        // }
        const id = getModuleId(wpModule);
        const moduleInfo = knownModules.get(id);
        if (!moduleInfo) {
            return;
        }
        if (moduleInfo.status === ModuleStatus.ORIGINAL) {
            wpModule.loaders = moduleInfo.loaders;
            return;
        }
        if (moduleInfo.status === ModuleStatus.REPLACED) {
            moduleInfo.loaders = wpModule.loaders;
            wpModule.loaders = [
                {
                    loader: stubLoader,
                    options: {
                        module: moduleInfo.replacedModule
                    }
                }
            ];
        }
    }
    _collectModules(compiler, wpModule) {
        const id = getModuleId(wpModule);
        const moduleInfo = knownModules.get(id);
        if (moduleInfo) {
            moduleInfo.compilers.add(compiler);
            return;
        }
        const replacedModule = this._getReplacedModule(wpModule);
        if (replacedModule) {
            knownModules.set(id, {
                status: ModuleStatus.REPLACED,
                replacedModule,
                compilers: new Set([compiler])
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
