"use strict";
/// <reference path="../../../client-env.d.ts" />
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
const react_dom_1 = __importDefault(require("react-dom"));
const react_router_dom_1 = require("react-router-dom");
const app_1 = __importDefault(require("../shared/app"));
const loadable_1 = __importDefault(require("../../loadable/"));
exports.bootstrap = ({ appData, appContainer }) => __awaiter(void 0, void 0, void 0, function* () {
    yield loadable_1.default.preloadReady(appData.dynamicIds);
    return react_dom_1.default.render(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
        react_1.default.createElement(app_1.default, null)), appContainer);
});
