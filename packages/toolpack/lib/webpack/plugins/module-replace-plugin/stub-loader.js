"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __importDefault(require("loader-utils"));
module.exports = function () {
    const { module, dep } = loader_utils_1.default.getOptions(this) || {};
    const sModule = JSON.stringify(module);
    this.cacheable(false);
    // this.addDependency(dep);
    return `
module.exports = require(${sModule})
`.trim();
};
