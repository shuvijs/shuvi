"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_react_1 = require("mobx-react");
const ModelApp_1 = require("./ModelApp");
exports.store = new ModelApp_1.ModelApp();
function useStore() {
    return exports.store;
}
exports.useStore = useStore;
function useSelector(selector) {
    return mobx_react_1.useObserver(() => selector(exports.store));
}
exports.useSelector = useSelector;
