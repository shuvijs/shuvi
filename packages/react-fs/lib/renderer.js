"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reconciler_1 = require("./reconciler");
const rootsMap = new Map();
function render(reactElement, rootDir, callback) {
    let root = rootsMap.get(rootDir);
    // Create a root Container if it doesnt exist
    if (!root) {
        root = reconciler_1.ReactFsReconciler.createContainer({ dir: rootDir }, false, false);
        rootsMap.set(rootDir, root);
    }
    // update the root Container
    return reconciler_1.ReactFsReconciler.updateContainer(reactElement, root, null, () => {
        callback && callback();
    });
}
exports.render = render;
