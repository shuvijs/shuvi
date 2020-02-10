"use strict";
/// <reference path="../../client-env.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const routes_1 = __importDefault(require("@shuvi-app/routes"));
const renderRoutes_1 = __importDefault(require("@shuvi/runtime-react/lib/runtime/router/renderRoutes"));
function App() {
    return react_1.default.createElement(react_1.default.Fragment, null, renderRoutes_1.default(routes_1.default));
}
exports.default = App;
