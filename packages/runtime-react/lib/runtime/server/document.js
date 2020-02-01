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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const documentContext_1 = require("../../documentContext");
function HtmlTag({ tagName, attrs = {} }) {
    const { innerHtml } = attrs, rest = __rest(attrs, ["innerHtml"]);
    if (innerHtml) {
        return react_1.default.createElement(tagName, Object.assign(Object.assign({}, rest), { dangerouslySetInnerHTML: {
                __html: innerHtml
            } }));
    }
    return react_1.default.createElement(tagName, attrs);
}
function Html(props) {
    return react_1.default.createElement("html", Object.assign({}, props));
}
function Tags(tags) {
    return (react_1.default.createElement(react_1.default.Fragment, null, tags.map((tag, index) => (react_1.default.createElement(HtmlTag, Object.assign({ key: index }, tag))))));
}
function Head() {
    const { documentProps } = react_1.useContext(documentContext_1.DocumentContext);
    return Tags(documentProps.headTags);
}
function Content() {
    const { documentProps } = react_1.useContext(documentContext_1.DocumentContext);
    return Tags(documentProps.contentTags);
}
const Scripts = () => {
    const { documentProps } = react_1.useContext(documentContext_1.DocumentContext);
    return Tags(documentProps.scriptTags);
};
class Document extends react_1.Component {
    getContextValue() {
        return {
            documentProps: this.props
        };
    }
    render() {
        return (react_1.default.createElement(documentContext_1.DocumentContext.Provider, { value: this.getContextValue() },
            react_1.default.createElement(Html, null,
                react_1.default.createElement(Head, null),
                react_1.default.createElement("body", null,
                    react_1.default.createElement(Content, null),
                    react_1.default.createElement(Scripts, null)))));
    }
}
exports.default = Document;
