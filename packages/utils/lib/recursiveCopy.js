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
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const async_sema_1 = require("async-sema");
const fsMkdir = util_1.promisify(fs_1.default.mkdir);
const fsStat = util_1.promisify(fs_1.default.stat);
const fsReaddir = util_1.promisify(fs_1.default.readdir);
const fsCopyFile = util_1.promisify(fs_1.default.copyFile);
const COPYFILE_EXCL = fs_1.default.constants.COPYFILE_EXCL;
function recursiveCopy(source, dest, { concurrency = 255, filter = () => true, } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const cwdPath = process.cwd();
        const from = path_1.default.resolve(cwdPath, source);
        const to = path_1.default.resolve(cwdPath, dest);
        const sema = new async_sema_1.Sema(concurrency);
        function _copy(item) {
            return __awaiter(this, void 0, void 0, function* () {
                const target = item.replace(from, to);
                const stats = yield fsStat(item);
                yield sema.acquire();
                if (stats.isDirectory()) {
                    try {
                        yield fsMkdir(target);
                    }
                    catch (err) {
                        // do not throw `folder already exists` errors
                        if (err.code !== 'EEXIST') {
                            throw err;
                        }
                    }
                    const files = yield fsReaddir(item);
                    yield Promise.all(files.map(file => _copy(path_1.default.join(item, file))));
                }
                else if (stats.isFile() &&
                    // before we send the path to filter
                    // we remove the base path (from) and replace \ by / (windows)
                    filter(item.replace(from, '').replace(/\\/g, '/'))) {
                    yield fsCopyFile(item, target, COPYFILE_EXCL);
                }
                sema.release();
                return;
            });
        }
        yield _copy(from);
    });
}
exports.recursiveCopy = recursiveCopy;
