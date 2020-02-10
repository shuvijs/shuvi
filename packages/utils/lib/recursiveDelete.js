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
const path_1 = require("path");
const util_1 = require("util");
const fsReaddir = util_1.promisify(fs_1.default.readdir);
const fsStat = util_1.promisify(fs_1.default.stat);
const fsRmdir = util_1.promisify(fs_1.default.rmdir);
const fsUnlink = util_1.promisify(fs_1.default.unlink);
const sleep = util_1.promisify(setTimeout);
const unlinkFile = (p, t = 1) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fsUnlink(p);
    }
    catch (e) {
        if ((e.code === "EBUSY" ||
            e.code === "ENOTEMPTY" ||
            e.code === "EPERM" ||
            e.code === "EMFILE") &&
            t < 3) {
            yield sleep(t * 100);
            return unlinkFile(p, t++);
        }
        if (e.code === "ENOENT") {
            return;
        }
        throw e;
    }
});
/**
 * Recursively read directory
 * @param {string} dir Directory to delete
 * @param {Object} options
 * @param {RegExp} options.filter Filter for the file name, only the relative file path is considered, not the full path
 * @param {RegExp} options.ignore Ignore certain files, only the relative file path is considered, not the full path
 * @param {string} options.rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 */
function recursiveDelete(dir, { filter, ignore, rootDir = dir } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        try {
            result = yield fsReaddir(dir);
        }
        catch (e) {
            if (e.code === "ENOENT") {
                return;
            }
            throw e;
        }
        yield Promise.all(result.map((part) => __awaiter(this, void 0, void 0, function* () {
            const absolutePath = path_1.join(dir, part);
            const pathStat = yield fsStat(absolutePath).catch(e => {
                if (e.code !== "ENOENT")
                    throw e;
            });
            if (!pathStat) {
                return;
            }
            const pp = absolutePath.replace(rootDir, "");
            if (ignore && ignore.test(pp)) {
                return;
            }
            if (filter && !filter.test(part)) {
                return;
            }
            if (pathStat.isDirectory()) {
                yield recursiveDelete(absolutePath, {
                    filter,
                    ignore,
                    rootDir: pp
                });
                return fsRmdir(absolutePath);
            }
            return unlinkFile(absolutePath);
        })));
    });
}
exports.recursiveDelete = recursiveDelete;
