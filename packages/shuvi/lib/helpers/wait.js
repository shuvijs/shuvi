"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function waitN(num, cb) {
    let count = 0;
    return function callback() {
        if (++count >= num) {
            cb();
        }
    };
}
exports.waitN = waitN;
