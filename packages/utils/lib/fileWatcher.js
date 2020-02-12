"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const watchpack_1 = __importDefault(require("watchpack"));
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
