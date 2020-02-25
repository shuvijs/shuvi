"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelFile_1 = require("./ModelFile");
const ModelPriorityFile_1 = require("./ModelPriorityFile");
var FileNode_1 = require("./FileNode");
exports.Dir = FileNode_1.Dir;
exports.isDir = FileNode_1.isDir;
exports.isFile = FileNode_1.isFile;
function createFile(name, options) {
    return new ModelFile_1.ModelFile(name, options);
}
exports.createFile = createFile;
function createPriorityFile(name, options) {
    return new ModelPriorityFile_1.ModelPriorityFile(name, options);
}
exports.createPriorityFile = createPriorityFile;
function isTemplateFile(obj) {
    return obj instanceof ModelFile_1.ModelFile;
}
exports.isTemplateFile = isTemplateFile;
function isPriorityFile(obj) {
    return obj instanceof ModelPriorityFile_1.ModelPriorityFile;
}
exports.isPriorityFile = isPriorityFile;
