"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
class File extends react_1.default.Component {
    shouldComponentUpdate(nextProps) {
        return (nextProps.name !== this.props.name ||
            nextProps.content !== this.props.content);
    }
    render() {
        return react_1.default.createElement("file", this.props);
    }
}
exports.default = File;
