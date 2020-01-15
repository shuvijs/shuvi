"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function waiter(count) {
    let resolve;
    new Promise(_resolve => {
        resolve = _resolve;
    });
}
exports.waiter = waiter;
