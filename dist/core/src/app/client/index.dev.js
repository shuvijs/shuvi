"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference lib="dom" />
const bootstrap_1 = require("@shuvi/app/bootstrap");
const constants_1 = require("@shuvi/shared/lib/constants");
const webpackHotDevClient_1 = __importDefault(require("./dev/webpackHotDevClient"));
const getAppData_1 = require("./helpers/getAppData");
const styleReady = new Promise(resolve => {
    (window.requestAnimationFrame || setTimeout)(() => {
        var _a;
        const el = (_a = document.querySelector(`#${constants_1.DEV_STYLE_ANCHOR_ID}`)) === null || _a === void 0 ? void 0 : _a.previousElementSibling;
        if (el) {
            el.parentNode.removeChild(el);
        }
        resolve();
    });
});
styleReady.then(() => {
    webpackHotDevClient_1.default();
    bootstrap_1.bootstrap({
        appData: getAppData_1.getAppData(),
        appContainer: document.getElementById(constants_1.CLIENT_CONTAINER_ID)
    });
});
