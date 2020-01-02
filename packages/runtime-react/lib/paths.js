"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const resolveSource = (relativePath, ext = "js") => `${path_1.join(__dirname, "source", relativePath)}.${ext}`;
exports.documentPath = resolveSource("document");
