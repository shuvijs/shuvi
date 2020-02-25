"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
const FileTemplateFile_1 = __importDefault(require("./FileTemplateFile"));
const FilePriorityFile_1 = __importDefault(require("./FilePriorityFile"));
const base_1 = require("./base");
const files_1 = require("../models/files");
class FileNode extends base_1.BaseComponent {
    constructor(props) {
        super(props);
        this._renderNode = this._renderNode.bind(this);
        this._renderFile = this._renderFile.bind(this);
    }
    _renderFile(file) {
        let Comp;
        if (files_1.isTemplateFile(file)) {
            Comp = FileTemplateFile_1.default;
        }
        else if (files_1.isPriorityFile(file)) {
            Comp = FilePriorityFile_1.default;
        }
        else {
            Comp = react_fs_1.File;
        }
        return react_1.default.createElement(Comp, Object.assign({}, file));
    }
    _renderDir(dir) {
        var _a;
        return (react_1.default.createElement(react_fs_1.Dir, { name: dir.name }, (_a = dir.children) === null || _a === void 0 ? void 0 : _a.map(node => this._renderNode(node))));
    }
    _renderNode(node) {
        if (files_1.isDir(node)) {
            return this._renderDir(node);
        }
        else if (files_1.isFile(node)) {
            return this._renderFile(node);
        }
        return null;
    }
    render() {
        return this._renderNode(this.props.file);
    }
}
exports.default = FileNode;
