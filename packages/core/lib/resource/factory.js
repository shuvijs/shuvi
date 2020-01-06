"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_1 = require("./resource");
const templateResource_1 = require("./templateResource");
function createResource(opts) {
    return new resource_1.Resource(opts);
}
exports.createResource = createResource;
function createTemplateResource(opts) {
    return new templateResource_1.TemplateResourceClass(opts);
}
exports.createTemplateResource = createTemplateResource;
