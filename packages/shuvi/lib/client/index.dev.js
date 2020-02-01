"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference lib="dom" />
const bootstrap_1 = require("@shuvi-app/bootstrap");
const constants_1 = require("../shared/constants");
const webpackHotDevClient_1 = __importDefault(require("./dev/webpackHotDevClient"));
const getAppData_1 = require("./helpers/getAppData");
// type Comp = any;
// const shuvi: ShuviGlobal = (window as any)[CLIENT_GLOBAL_NAME];
webpackHotDevClient_1.default();
bootstrap_1.bootstrap({
    appData: getAppData_1.getAppData(),
    appContainer: document.getElementById(constants_1.CLIENT_CONTAINER_ID)
});
