"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let history;
//@internal
function setHistory(value) {
    history = value;
}
exports.setHistory = setHistory;
function push(...args) {
    // @ts-ignore
    history.push(...args);
}
function replace(...args) {
    // @ts-ignore
    history.replace(...args);
}
function go(...args) {
    // @ts-ignore
    history.go(...args);
}
function goBack(...args) {
    // @ts-ignore
    history.goBack(...args);
}
function goForward(...args) {
    // @ts-ignore
    history.goForward(...args);
}
function onChange(listener) {
    return history.listen(listener);
}
const router = {
    push,
    replace,
    go,
    goBack,
    goForward,
    onChange
};
exports.default = router;
