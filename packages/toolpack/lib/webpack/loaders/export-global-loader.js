"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __importDefault(require("loader-utils"));
const nextClientPagesLoader = function () {
    const { absolutePath, exportName, globalName } = loader_utils_1.default.getOptions(this);
    const quotedGlobalName = JSON.stringify(globalName);
    const quotedAbsolutePagePath = JSON.stringify(absolutePath);
    const quotedExportName = JSON.stringify(exportName);
    return `
var mod = require(${quotedAbsolutePagePath})
(window[${quotedGlobalName}] = window[${quotedGlobalName}] || {})[${quotedExportName}] = mod.default || mod

if(module.hot) {
  module.hot.accept(${quotedAbsolutePagePath}, function() {
    if(!${quotedGlobalName} in window) return

    var updatedMod = require(${quotedAbsolutePagePath})
    window[${quotedGlobalName}] = updatedMod.default || updatedMod
  })
}
`;
};
exports.default = nextClientPagesLoader;
