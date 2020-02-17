"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const FileNode_1 = require("./files/FileNode");
function getDirAndName(path) {
    const segs = path.split("/");
    const [name] = segs.splice(-1, 1);
    return {
        name,
        dirname: segs.join("/")
    };
}
function findByPath(path, files) {
    path = path.replace(/^\//, "");
    let node = new FileNode_1.Dir("root", files);
    if (path === "") {
        return node;
    }
    const segs = path.split("/").reverse();
    while (segs.length) {
        if (!node || !FileNode_1.isDir(node))
            return;
        const searchName = segs.pop();
        node = node.children.find(file => file.name === searchName);
    }
    return node;
}
function ensureDir(path, files) {
    const node = findByPath(path, files);
    if (node) {
        if (!FileNode_1.isDir(node)) {
            throw new Error(`File "${node.name}" existed`);
        }
        return;
    }
    else {
        const { dirname, name } = getDirAndName(path);
        ensureDir(dirname, files);
        addFileNode(dirname, new FileNode_1.Dir(name), files);
    }
}
function addFileNode(dir, file, files) {
    const node = findByPath(dir, files);
    if (!node || !FileNode_1.isDir(node))
        return;
    node.children.push(file);
}
class ModelApp {
    constructor() {
        this.extraFiles = [];
    }
    addFile(file, dir = "/") {
        const files = this.extraFiles;
        ensureDir(dir, files);
        addFileNode(dir, file, files);
    }
    removeFile(path) {
        const files = this.extraFiles;
        const { dirname, name } = getDirAndName(path);
        const node = findByPath(dirname, files);
        if (!node || !FileNode_1.isDir(node))
            return;
        const index = node.children.findIndex(file => file.name === name);
        if (index >= 0) {
            node.children.splice(index, 1);
        }
    }
}
__decorate([
    mobx_1.observable
], ModelApp.prototype, "bootstrapModule", void 0);
__decorate([
    mobx_1.observable
], ModelApp.prototype, "appModuleFallback", void 0);
__decorate([
    mobx_1.observable
], ModelApp.prototype, "appModuleLookups", void 0);
__decorate([
    mobx_1.observable
], ModelApp.prototype, "documentModuleFallback", void 0);
__decorate([
    mobx_1.observable
], ModelApp.prototype, "documentModuleLookups", void 0);
__decorate([
    mobx_1.observable
], ModelApp.prototype, "routesContent", void 0);
__decorate([
    mobx_1.observable
], ModelApp.prototype, "extraFiles", void 0);
__decorate([
    mobx_1.action
], ModelApp.prototype, "addFile", null);
__decorate([
    mobx_1.action
], ModelApp.prototype, "removeFile", null);
exports.ModelApp = ModelApp;
