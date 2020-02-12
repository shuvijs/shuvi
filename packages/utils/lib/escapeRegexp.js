"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function escapeRegExp(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
exports.escapeRegExp = escapeRegExp;
