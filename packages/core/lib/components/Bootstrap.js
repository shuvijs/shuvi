"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FileTemplate_1 = __importDefault(require("./FileTemplate"));
const Base_1 = require("./Base");
class Bootstrap extends Base_1.BaseComponent {
    render() {
        const { file } = this.props;
        return react_1.default.createElement(FileTemplate_1.default, { name: "bootstrap.js", templateFile: file });
    }
}
exports.default = Bootstrap;
