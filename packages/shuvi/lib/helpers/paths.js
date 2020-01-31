"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.resolveTemplate = (relativePath, ext = "tpl") => `${path_1.resolve(__dirname, "..", "..", "template", relativePath)}.${ext}`;
