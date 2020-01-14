"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
const fs_extra_1 = __importDefault(require("fs-extra"));
const watcher_1 = require("../helper/watcher");
const utils_1 = require("../utils");
function findFirstExistedFile(files) {
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (fs_extra_1.default.existsSync(file)) {
            return file;
        }
    }
    return null;
}
class FileSelector extends react_1.default.Component {
    constructor(props) {
        super(props);
        this._knownFiles = new Map();
        const file = findFirstExistedFile(props.files);
        let selectedFile;
        if (file) {
            selectedFile = file;
            this._knownFiles.set(file, true);
        }
        else {
            selectedFile = props.fallbackFile;
        }
        this.state = {
            file: selectedFile
        };
        this._onFilesChange = this._onFilesChange.bind(this);
    }
    _onFilesChange({ removals, changes }) {
        console.log('changes', changes);
        console.log('removals', removals);
        for (let index = 0; index < changes.length; index++) {
            const existed = changes[index];
            this._knownFiles.set(existed, true);
        }
        for (let index = 0; index < removals.length; index++) {
            const removed = removals[index];
            this._knownFiles.delete(removed);
        }
        const { files, fallbackFile } = this.props;
        let selectedFile = fallbackFile;
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            if (this._knownFiles.has(file)) {
                selectedFile = file;
                break;
            }
        }
        if (selectedFile !== this.state.file) {
            console.log("update selected file", selectedFile);
            this.setState({
                file: selectedFile
            });
        }
    }
    _destoryWatcher() {
        if (this._watcherHandle) {
            this._watcherHandle();
        }
    }
    _createWatcher() {
        this._destoryWatcher();
        this._watcherHandle = watcher_1.watch({ files: this.props.files }, this._onFilesChange);
    }
    componentDidMount() {
        this._createWatcher();
    }
    componentWillUnmount() {
        this._destoryWatcher();
    }
    componentDidUpdate(prevProps) {
        if (!utils_1.arrayEqual(prevProps.files, this.props.files)) {
            this._createWatcher();
        }
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
exports.default = FileSelector;
