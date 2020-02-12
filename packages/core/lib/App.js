"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
const FileNode_1 = __importDefault(require("./components/FileNode"));
const Bootstrap_1 = __importDefault(require("./components/Bootstrap"));
const store_1 = require("./store");
function App(props) {
    const files = store_1.useStore(state => state.files);
    const bootstrapFilePath = store_1.useStore(state => state.bootstrapFilePath);
    const routesSource = store_1.useStore(state => state.routesSource);
    react_1.useEffect(() => {
        props.onDidUpdate();
    });
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(Bootstrap_1.default, { file: bootstrapFilePath }),
        react_1.default.createElement(react_fs_1.File, { name: "routes.js", content: routesSource }),
        files.map(file => (react_1.default.createElement(FileNode_1.default, { key: file.name, file: file })))));
}
class AppContainer extends react_1.default.Component {
    componentDidCatch(error, errorInfo) {
        console.error("error", error);
    }
    componentDidUpdate() {
        this.props.onDidUpdate();
    }
    render() {
        return react_1.default.createElement(App, Object.assign({}, this.props));
    }
}
exports.default = AppContainer;
