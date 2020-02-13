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
const react_router_config_1 = require("react-router-config");
const history_1 = require("./router/history");
const router_1 = require("./router/router");
const loadable_1 = require("./loadable");
function matchRoutes(routes, pathname) {
    return react_router_config_1.matchRoutes(routes, pathname);
}
exports.matchRoutes = matchRoutes;
function renderDocument(Document, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return `<!DOCTYPE html>${server_1.renderToStaticMarkup(react_1.default.createElement(Document, Object.assign({}, options.documentProps)))}`;
    });
}
exports.renderDocument = renderDocument;
function renderApp(App, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pathname, context, routeProps } = options;
        const history = history_1.createServerHistory({
            basename: "",
            location: pathname,
            context
        });
        router_1.setHistory(history);
        const htmlContent = server_1.renderToString(
        // @ts-ignore staticContext is not declared in @types/react-router-dom
        react_1.default.createElement(react_router_dom_1.Router, { history: history, staticContext: context },
            react_1.default.createElement(loadable_1.LoadableContext.Provider, { value: moduleName => context.loadableModules.push(moduleName) },
                react_1.default.createElement(App, { routeProps: routeProps }))));
        return {
            appHtml: htmlContent
        };
    });
}
exports.renderApp = renderApp;
