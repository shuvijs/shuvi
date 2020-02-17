"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_fs_1 = require("@shuvi/react-fs");
const fs_extra_1 = __importDefault(require("fs-extra"));
const handlebars_1 = __importDefault(require("handlebars"));
const utils_1 = require("../utils");
const Base_1 = require("./Base");
class FileTemplate extends Base_1.BaseComponent {
    constructor() {
        super(...arguments);
        this._compileTemplate = utils_1.memoizeOne((template) => handlebars_1.default.compile(template));
        this._readFile = utils_1.memoizeOne((path) => fs_extra_1.default.readFileSync(path, "utf8"));
    }
    _renderTemplate(template) {
        const templateFn = this._compileTemplate(template);
        const content = templateFn(this.props.data || {});
        return react_1.default.createElement(react_fs_1.File, { name: this.props.name, content: content });
    }
    render() {
        const { templateFile, template } = this.props;
        if (template) {
            return this._renderTemplate(template);
        }
        if (templateFile) {
            const tmplContent = this._readFile(templateFile);
            return this._renderTemplate(tmplContent);
        }
        return null;
    }
}
exports.default = FileTemplate;
