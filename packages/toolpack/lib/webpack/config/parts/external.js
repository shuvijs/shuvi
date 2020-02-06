"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = __importDefault(require("resolve"));
function match(value, tests) {
    for (let index = 0; index < tests.length; index++) {
        const test = tests[index];
        if (typeof test === "string") {
            return test === value;
        }
        return value.match(test);
    }
    return false;
}
function nodeExternals({ projectRoot }) {
    const externals = [];
    const normalNodeExternal = (context, request, callback) => {
        function transpiled() {
            return callback(null, undefined);
        }
        function external() {
            return callback(null, `commonjs ${request}`);
        }
        const notExternalModules = [];
        if (match(request, notExternalModules)) {
            return transpiled();
        }
        // fix hooks not work when using yarn link
        if (process.env.SHUVI__SECRET_DO_NOT_USE__LINKED_PACKAGE === "true") {
            if (match(request, ["react"])) {
                return external();
            }
        }
        // Relative requires don't need custom resolution, because they
        // are relative to requests we've already resolved here.
        // Absolute requires (require('/foo')) are extremely uncommon, but
        // also have no need for customization as they're already resolved.
        const start = request.charAt(0);
        if (start === "." || start === "/") {
            return transpiled();
        }
        let res;
        try {
            res = resolve_1.default.sync(request, { basedir: context });
        }
        catch (err) {
            // If the request cannot be resolved, we need to tell webpack to
            // "bundle" it so that webpack shows an error (that it cannot be
            // resolved).
            return transpiled();
        }
        if (!res) {
            return transpiled();
        }
        // fix hooks not work when using yarn link
        if (process.env.SHUVI__SECRET_DO_NOT_USE__LINKED_PACKAGE === "true") {
            if (match(res, [
                /node_modules[/\\]@shuvi[/\\]runtime-[^/\\]+[/\\]lib[/\\]/
            ]) &&
                !match(res, [
                    /node_modules[/\\]@shuvi[/\\]runtime-[^/\\]+[/\\]lib[/\\]runtime[/\\]/
                ])) {
                return external();
            }
        }
        let baseRes;
        try {
            baseRes = resolve_1.default.sync(request, { basedir: projectRoot });
        }
        catch (err) { }
        if (baseRes !== res) {
            return transpiled();
        }
        // runtime have to be transpiled
        if (res.match(/node_modules[/\\]@shuvi[/\\]runtime-[^/\\]+[/\\]lib[/\\]runtime[/\\]/) ||
            res.match(/node_modules[/\\]@babel[/\\]runtime-corejs2[/\\]/) ||
            (context.match(/node_modules[/\\]@babel[/\\]runtime-corejs2[/\\]/) &&
                res.match(/node_modules[/\\]core-js[/\\]/))) {
            return transpiled();
        }
        // Webpack itself has to be compiled because it doesn't always use module relative paths
        if (res.match(/node_modules[/\\]webpack/) ||
            res.match(/node_modules[/\\]css-loader/)) {
            return transpiled();
        }
        // Anything else that is standard JavaScript within `node_modules`
        // can be externalized.
        if (res.match(/node_modules[/\\].*\.js$/)) {
            return external();
        }
        transpiled();
    };
    externals.push(normalNodeExternal);
    return externals;
}
exports.nodeExternals = nodeExternals;
