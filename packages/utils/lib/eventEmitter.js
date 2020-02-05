"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function emitter() {
    const all = Object.create(null);
    return {
        on(type, handler) {
            (all[type] || (all[type] = [])).push(handler);
        },
        off(type, handler) {
            if (all[type]) {
                const index = all[type].indexOf(handler);
                if (index >= 0) {
                    all[type].splice(index, 1);
                }
            }
        },
        emit(type, ...evts) {
            (all[type] || []).slice().forEach((handler) => {
                handler(...evts);
            });
        }
    };
}
exports.default = emitter;
