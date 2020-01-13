"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FileNode_1 = __importDefault(require("./components/FileNode"));
const Bootstrap_1 = __importDefault(require("./components/Bootstrap"));
const store_1 = require("./store");
function App() {
    const files = store_1.useStore(state => state.files);
    const bootstrapSrc = store_1.useStore(state => state.bootstrapSrc);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(Bootstrap_1.default, { src: bootstrapSrc }),
        files.map(file => (react_1.default.createElement(FileNode_1.default, { key: file.name, file: file })))));
}
exports.default = App;
