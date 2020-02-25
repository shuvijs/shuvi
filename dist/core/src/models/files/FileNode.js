"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class File {
    constructor(name) {
        this.name = name;
    }
}
__decorate([
    mobx_1.observable
], File.prototype, "name", void 0);
exports.File = File;
class Dir {
    constructor(name, children = []) {
        this.name = name;
        this.children = children;
    }
}
__decorate([
    mobx_1.observable
], Dir.prototype, "name", void 0);
exports.Dir = Dir;
function isDir(obj) {
    return obj instanceof Dir;
}
exports.isDir = isDir;
function isFile(obj) {
    return obj instanceof File;
}
exports.isFile = isFile;
