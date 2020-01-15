"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
var File_1 = require("./components/File");
exports.File = File_1.default;
var Dir_1 = require("./components/Dir");
exports.Dir = Dir_1.default;
exports.default = {
    render: renderer_1.render
};
