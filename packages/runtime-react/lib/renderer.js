"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const server_1 = require("react-dom/server");
const react_router_dom_1 = require("react-router-dom");
const loadable_1 = __importDefault(require("./loadable"));
function renderDocument(req, res, Document, App, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let htmlContent = "";
        if (App) {
            yield loadable_1.default.preloadAll();
            const context = {};
            htmlContent = server_1.renderToString(react_1.default.createElement(react_router_dom_1.StaticRouter, { location: req.url, context: context },
                react_1.default.createElement(App, null)));
        }
        return `<!DOCTYPE html>${server_1.renderToStaticMarkup(react_1.default.createElement(Document, Object.assign({}, options.documentProps, { appHtml: htmlContent })))}`;
    });
}
exports.renderDocument = renderDocument;
