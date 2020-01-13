"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FileTemplate_1 = __importDefault(require("./FileTemplate"));
function Bootstrap({ src }) {
    return react_1.default.createElement(FileTemplate_1.default, { name: "bootstrap.js", templateSrc: src });
}
exports.default = Bootstrap;
