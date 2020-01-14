"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
const FileTemplate_1 = __importDefault(require("./FileTemplate"));
const FileSelector_1 = __importDefault(require("./FileSelector"));
class FileNode extends react_1.default.Component {
    constructor(props) {
        super(props);
        this._renderNode = this._renderNode.bind(this);
        this._renderFile = this._renderFile.bind(this);
    }
    _renderFile(file) {
        const { type } = file, props = __rest(file, ["type"]);
        let Comp;
        switch (type) {
            case "template":
                Comp = FileTemplate_1.default;
                break;
            case "selector":
                Comp = FileSelector_1.default;
                break;
            default:
                return null;
        }
        return react_1.default.createElement(Comp, Object.assign({}, props));
    }
    _renderDir(dir) {
        var _a;
        return (react_1.default.createElement(react_fs_1.Dir, { name: dir.name }, (_a = dir.children) === null || _a === void 0 ? void 0 : _a.map(node => this._renderNode(node))));
    }
    _renderNode(node) {
        if (node.$$type === "dir") {
            return this._renderDir(node);
        }
        else if (node.$$type === "file") {
            return this._renderFile(node);
        }
        return null;
    }
    render() {
        return this._renderNode(this.props.file);
    }
}
exports.default = FileNode;
