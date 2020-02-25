"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const path_1 = __importDefault(require("path"));
const mobx_react_1 = require("mobx-react");
const react_fs_1 = __importDefault(require("@shuvi/react-fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const App_1 = __importDefault(require("./App"));
const paths_1 = require("./paths");
const store_1 = require("./models/store");
const Base_1 = require("./components/Base");
class AppCoreImpl {
    constructor({ config }) {
        this._onBuildDoneCbs = [];
        this.config = config;
        this.paths = paths_1.getPaths({
            cwd: this.config.cwd,
            outputPath: this.config.outputPath
        });
    }
    resolveInternalFile(...paths) {
        return path_1.default.join(__dirname, "app", ...paths);
    }
    setBootstrapModule(module) {
        store_1.store.bootstrapModule = module;
    }
    setAppModule(lookups, fallback) {
        store_1.store.appModuleFallback = fallback;
        store_1.store.appModuleLookups = lookups;
    }
    setDocumentModule(lookups, fallback) {
        store_1.store.documentModuleFallback = fallback;
        store_1.store.documentModuleLookups = lookups;
    }
    setRoutesSource(content) {
        store_1.store.routesContent = content;
    }
    addFile(file) {
        store_1.store.addFile(file);
    }
    waitUntilBuild() {
        return new Promise(resolve => {
            this._onBuildDoneCbs.push(resolve);
        });
    }
    build(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.emptyDir(this.paths.appDir);
            return new Promise(resolve => {
                react_fs_1.default.render(react_1.default.createElement(App_1.default, { onDidUpdate: this._onBuildDone.bind(this) }), this.paths.appDir, () => {
                    resolve();
                });
            });
        });
    }
    buildOnce(options) {
        return __awaiter(this, void 0, void 0, function* () {
            mobx_react_1.useStaticRendering(true);
            Base_1.swtichOffLifeCycle();
            try {
                yield this.build(options);
            }
            finally {
                Base_1.swtichOnLifeCycle();
                mobx_react_1.useStaticRendering(false);
            }
        });
    }
    _onBuildDone() {
        while (this._onBuildDoneCbs.length) {
            const cb = this._onBuildDoneCbs.shift();
            cb();
        }
    }
}
function createApp(options) {
    return new AppCoreImpl(options);
}
exports.createApp = createApp;
