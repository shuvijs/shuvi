"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const watchpack_1 = __importStar(require("watchpack"));
exports.TimeInfo = watchpack_1.TimeInfo;
const options = {
    // options:
    aggregateTimeout: 300,
    // fire "aggregated" event when after a change for 1000ms no additional change occurred
    // aggregated defaults to undefined, which doesn't fire an "aggregated" event
    ignored: ["**/.git"]
    // ignored: "string" - a glob pattern for files or folders that should not be watched
    // ignored: ["string", "string"] - multiple glob patterns that should be ignored
    // ignored: /regexp/ - a regular expression for files or folders that should not be watched
    // All subdirectories are ignored too
};
function watch({ files, directories }, cb) {
    const wp = new watchpack_1.default(options);
    wp.on("aggregated", (changes, removals) => {
        const knownFiles = wp.getTimeInfoEntries();
        cb({
            changes: Array.from(changes),
            removals: Array.from(removals),
            getAllFiles() {
                const res = [];
                for (const [file, timeinfo] of knownFiles.entries()) {
                    if (timeinfo && timeinfo.accuracy !== undefined) {
                        res.push(file);
                    }
                }
                return res;
            }
        });
    });
    wp.watch({ files, directories });
    return () => {
        wp.close();
    };
}
exports.watch = watch;
