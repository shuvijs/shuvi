"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __importDefault(require("loader-utils"));
const routeComponentLoader = function () {
    const { componentAbsolutePath } = loader_utils_1.default.getOptions(this);
    return `
const = require("${componentAbsolutePath}?__shuvi-route")
`.trim();
};
exports.default = routeComponentLoader;
