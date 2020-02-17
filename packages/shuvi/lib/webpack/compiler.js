"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = __importDefault(require("webpack"));
class CompilerHelper {
    constructor() {
        this._compiler = null;
        this._configs = [];
    }
    addConfig(config) {
        if (this._compiler) {
            return this;
        }
        this._configs.push(config);
        return this;
    }
    getCompiler() {
        if (!this._compiler) {
            this._compiler = webpack_1.default(this._configs);
        }
        return this._compiler;
    }
    getSubCompiler(name) {
        if (!this._compiler) {
            return;
        }
        return this._compiler.compilers.find(compiler => compiler.name === name);
    }
}
function createCompilerHelper() {
    return new CompilerHelper();
}
exports.createCompilerHelper = createCompilerHelper;
