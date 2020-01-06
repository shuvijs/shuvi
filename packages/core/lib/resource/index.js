"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var resource_1 = require("./resource");
exports.Resource = resource_1.Resource;
var templateResource_1 = require("./templateResource");
exports.createTemplateContext = templateResource_1.createTemplateContext;
__export(require("./factory"));
