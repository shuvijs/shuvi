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
const react_fs_1 = __importDefault(require("@shuvi/react-fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const App_1 = __importDefault(require("./App"));
const paths_1 = require("./paths");
const store_1 = require("./store");
const Base_1 = require("./components/Base");
const utils_1 = require("./utils");
class AppCoreImpl {
    constructor({ config }) {
        this._onBuildDoneCbs = [];
        this.config = config;
        this.paths = paths_1.getPaths({
            cwd: this.config.cwd,
            outputPath: this.config.outputPath
        });
    }
    resolveAppFile(filename) {
        return utils_1.joinPath(this.paths.appDir, filename);
    }
    resolveSrcFile(filename) {
        return utils_1.joinPath(this.paths.srcDir, filename);
    }
    resolveBuildFile(filename) {
        return utils_1.joinPath(this.paths.buildDir, filename);
    }
    getPublicUrlPath(buildPath) {
        return utils_1.joinPath(this.config.publicPath, buildPath);
    }
    addSelectorFile(path, selectFileList, fallbackFile) {
        store_1.addSelectorFile(path, selectFileList, fallbackFile);
    }
    addTemplateFile(path, templateFile, data = {}) {
        store_1.addTemplateFile(path, templateFile, data);
    }
    addFile(path, { content }) {
        store_1.addFile(path, content);
    }
    setRoutesSource(content) {
        store_1.setRoutesSource(content);
    }
    waitUntilBuild() {
        return new Promise(resolve => {
            this._onBuildDoneCbs.push(resolve);
        });
    }
    build(options) {
        return __awaiter(this, void 0, void 0, function* () {
            store_1.initBootstrap({ bootstrapFilePath: options.bootstrapFilePath });
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
            Base_1.swtichOffLifeCycle();
            try {
                yield this.build(options);
            }
            finally {
                Base_1.swtichOnLifeCycle();
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
function app(options) {
    return new AppCoreImpl(options);
}
exports.app = app;
