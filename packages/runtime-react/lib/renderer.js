"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const server_1 = require("react-dom/server");
exports.renderDocument = (Document, options) => {
    return `<!DOCTYPE html>${server_1.renderToStaticMarkup(react_1.default.createElement(Document, Object.assign({}, options.documentProps)))}`;
};
exports.renderApp = (App) => {
    return server_1.renderToString(react_1.default.createElement(App, null));
};
