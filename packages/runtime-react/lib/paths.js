"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.resolveRuntime = (relativePath, ext = "js") => `${path_1.join(__dirname, "runtime", relativePath)}.${ext}`;
exports.resolveTemplate = (relativePath, ext = "tpl") => `${path_1.join(__dirname, "..", "template", relativePath)}.${ext}`;
