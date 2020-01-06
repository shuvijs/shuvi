"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.resolveSource = (relativePath, ext = "js") => `${path_1.join(__dirname, relativePath)}.${ext}`;
