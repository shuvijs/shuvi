"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filenameRE = /\(([^)]+\.js):(\d+):(\d+)\)$/;
function rewriteStacktrace(e, distDir) {
    if (!e || typeof e.stack !== 'string') {
        return;
    }
    const lines = e.stack.split('\n');
    const result = lines.map((line) => {
        return rewriteTraceLine(line, distDir);
    });
    e.stack = result.join('\n');
}
exports.rewriteStacktrace = rewriteStacktrace;
function rewriteTraceLine(trace, distDir) {
    const m = trace.match(filenameRE);
    if (m == null) {
        return trace;
    }
    const filename = m[1];
    const filenameLink = filename
        .replace(distDir, '/_next/development')
        .replace(/\\/g, '/');
    trace = trace.replace(filename, filenameLink);
    return trace;
}
