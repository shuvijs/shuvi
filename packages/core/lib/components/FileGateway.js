"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
class TemplateFile extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: props.files[props.files.length - 1]
        };
    }
    render() {
        const { name } = this.props;
        const { file } = this.state;
        return (react_1.default.createElement(react_fs_1.File, { name: name, content: `
export { default } from "${file}";
export * from "${file}";
        `.trim() }));
    }
}
exports.default = TemplateFile;
