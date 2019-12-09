"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fork_ts_checker_webpack_plugin_1 = __importDefault(require("fork-ts-checker-webpack-plugin"));
var codeframeFormatter_1 = require("fork-ts-checker-webpack-plugin/lib/formatter/codeframeFormatter");
exports.createCodeframeFormatter = codeframeFormatter_1.createCodeframeFormatter;
exports.default = fork_ts_checker_webpack_plugin_1.default;
