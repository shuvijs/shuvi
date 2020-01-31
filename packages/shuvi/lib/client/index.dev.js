"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference lib="dom" />
const bootstrap_1 = require("@shuvi-app/bootstrap");
const webpackHotDevClient_1 = __importDefault(require("./dev/webpackHotDevClient"));
// type Comp = any;
// const shuvi: ShuviGlobal = (window as any)[CLIENT_GLOBAL_NAME];
webpackHotDevClient_1.default();
bootstrap_1.bootstrap();
