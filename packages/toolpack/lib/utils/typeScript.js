"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = __importDefault(require("resolve"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cache = Object.create(null);
function getProjectInfo(projectRoot) {
    let info = cache[projectRoot];
    if (!info) {
        let typeScriptPath;
        try {
            typeScriptPath = resolve_1.default.sync("typescript", {
                basedir: projectRoot
            });
        }
        catch (_) { }
        const tsConfigPath = path_1.default.join(projectRoot, "tsconfig.json");
        const useTypeScript = Boolean(typeScriptPath && fs_1.default.existsSync(tsConfigPath));
        info = {
            typeScriptPath,
            useTypeScript,
            tsConfigPath
        };
    }
    return info;
}
exports.getProjectInfo = getProjectInfo;
