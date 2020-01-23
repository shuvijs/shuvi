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
