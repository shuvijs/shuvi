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
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const bootstrap_1 = require("./bootstrap");
const paths_1 = require("./paths");
class ApplicationClass {
    constructor({ config }) {
        this._bootstrap = new bootstrap_1.Bootstrap();
        this.config = config;
        this.paths = paths_1.getPaths({
            cwd: this.config.cwd,
            outputPath: this.config.outputPath
        });
    }
    getPublicPath(buildPath) {
        const stripEndSlash = this.config.publicPath.replace(/\/+$/, "");
        const stripBeginSlash = buildPath.replace(/^\/+/, "");
        return `${stripEndSlash}/${stripBeginSlash}`;
    }
    getBootstrapModule() {
        return this._bootstrap;
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.emptyDir(this.paths.appDir);
            yield this._bootstrap.build(this);
            // await Promise.all(this.getResources().map(r => r.build(this)));
            return;
        });
    }
    buildResource(moduleName, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield res.build(this);
            const output = path_1.default.join(this.paths.appDir, moduleName, res.name);
            yield fs_extra_1.default.ensureDir(path_1.default.dirname(output));
            return fs_extra_1.default.writeFile(output, content, { encoding: "utf8" });
        });
    }
}
function app(options) {
    return new ApplicationClass(options);
}
exports.app = app;
