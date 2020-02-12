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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const fsReaddir = util_1.promisify(fs_1.default.readdir);
const fsStat = util_1.promisify(fs_1.default.stat);
function runTest(test, v) {
    if (typeof test === "function") {
        return test(v);
    }
    return test.test(v);
}
/**
 * Recursively read directory
 * @param {string} dir Directory to read
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the name part is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the name part is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @param {string} options.arr This doesn't have to be provided, it's used for the recursion
 * @returns {Promise<string[]>} Promise array holding all relative paths
 */
function recursiveReadDir(dir, { filter, ignore, rootDir = dir, arr = [] } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield fsReaddir(dir);
        yield Promise.all(result.map((part) => __awaiter(this, void 0, void 0, function* () {
            const absolutePath = path_1.default.join(dir, part);
            const pp = absolutePath.replace(rootDir, "");
            if (ignore && ignore.test(pp)) {
                return;
            }
            const pathStat = yield fsStat(absolutePath);
            if (pathStat.isDirectory()) {
                yield recursiveReadDir(absolutePath, { filter, ignore, arr, rootDir });
                return;
            }
            if (filter && !runTest(filter, part)) {
                return;
            }
            arr.push(pp);
        })));
        return arr.sort();
    });
}
exports.recursiveReadDir = recursiveReadDir;
/**
 * Recursively read directory
 * @param {string} dir Directory to read
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the name part is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the name part is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @param {string} options.arr This doesn't have to be provided, it's used for the recursion
 * @returns {string[]} Promise array holding all relative paths
 */
function recursiveReadDirSync(dir, { filter, ignore, rootDir = dir, arr = [] } = {}) {
    const result = fs_1.default.readdirSync(dir);
    result.forEach((part) => {
        const absolutePath = path_1.default.join(dir, part);
        if (ignore && ignore.test(part))
            return;
        const pathStat = fs_1.default.statSync(absolutePath);
        if (pathStat.isDirectory()) {
            recursiveReadDirSync(absolutePath, { filter, ignore, arr, rootDir });
            return;
        }
        if (filter && !filter.test(part)) {
            return;
        }
        arr.push(absolutePath.replace(rootDir, ""));
    });
    return arr.sort();
}
exports.recursiveReadDirSync = recursiveReadDirSync;
