"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
const fileWatcher_1 = require("@shuvi/utils/lib/fileWatcher");
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../utils");
const Base_1 = require("./Base");
function findFirstExistedFile(files) {
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (fs_extra_1.default.existsSync(file)) {
            return file;
        }
    }
    return null;
}
class FileSelector extends Base_1.BaseComponent {
    constructor(props) {
        super(props);
        this._knownFiles = new Map();
        const file = findFirstExistedFile(props.lookupFiles);
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
        for (let index = 0; index < changes.length; index++) {
            const existed = changes[index];
            this._knownFiles.set(existed, true);
        }
        for (let index = 0; index < removals.length; index++) {
            const removed = removals[index];
            this._knownFiles.delete(removed);
        }
        const { lookupFiles, fallbackFile } = this.props;
        let selectedFile = fallbackFile;
        for (let index = 0; index < lookupFiles.length; index++) {
            const file = lookupFiles[index];
            if (this._knownFiles.has(file)) {
                selectedFile = file;
                break;
            }
        }
        if (selectedFile !== this.state.file) {
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
        if (this.props.lookupFiles.length) {
            this._watcherHandle = fileWatcher_1.watch({ files: this.props.lookupFiles }, this._onFilesChange);
        }
    }
    componentDidMount() {
        this._createWatcher();
    }
    componentWillUnmount() {
        this._destoryWatcher();
    }
    componentDidUpdate(prevProps) {
        if (!utils_1.arrayEqual(prevProps.lookupFiles, this.props.lookupFiles)) {
            this._createWatcher();
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (this.state !== nextState ||
            this.props.fallbackFile !== nextProps.fallbackFile ||
            !utils_1.arrayEqual(this.props.lookupFiles, nextProps.lookupFiles));
    }
    render() {
        const { name } = this.props;
        const { file } = this.state;
        return (react_1.default.createElement(react_fs_1.File, { name: name, content: `module.exports = require("${file}");` }));
    }
}
exports.default = FileSelector;
