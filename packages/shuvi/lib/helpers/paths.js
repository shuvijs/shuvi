"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.resolvePackageFile = (...paths) => `${path_1.resolve(__dirname, "..", "..", ...paths)}`;
exports.resolveTemplate = (relativePath, ext = "tpl") => exports.resolvePackageFile("template", `${relativePath}.${ext}`);
