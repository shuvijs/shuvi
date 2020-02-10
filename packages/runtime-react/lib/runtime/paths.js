"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.resolveDistFile = (...paths) => `${path_1.resolve(__dirname, "..", "..", 'lib', ...paths)}`;
