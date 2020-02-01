"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function acceptsHtml(header, { htmlAcceptHeaders = ["text/html", "*/*"] } = {}) {
    for (var i = 0; i < htmlAcceptHeaders.length; i++) {
        if (header.indexOf(htmlAcceptHeaders[i]) !== -1) {
            return true;
        }
    }
    return false;
}
exports.acceptsHtml = acceptsHtml;
function dedupe(bundles, prop) {
    const files = new Set();
    const kept = [];
    for (const bundle of bundles) {
        if (files.has(bundle[prop]))
            continue;
        files.add(bundle[prop]);
        kept.push(bundle);
    }
    return kept;
}
exports.dedupe = dedupe;
