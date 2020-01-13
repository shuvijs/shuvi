"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reconciler_1 = __importDefault(require("./reconciler"));
var File_1 = require("./components/File");
exports.File = File_1.default;
var Dir_1 = require("./components/Dir");
exports.Dir = Dir_1.default;
exports.default = reconciler_1.default;
