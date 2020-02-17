"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FileTemplateFile_1 = __importDefault(require("./FileTemplateFile"));
const Base_1 = require("./Base");
class Bootstrap extends Base_1.BaseComponent {
    render() {
        const { module } = this.props;
        return (react_1.default.createElement(FileTemplateFile_1.default, { name: "bootstrap.js", template: `export * from "${module}"` }));
    }
}
exports.default = Bootstrap;
