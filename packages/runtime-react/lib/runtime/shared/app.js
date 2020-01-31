"use strict";
/// <reference types="@shuvi/core/shuvi-app" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_config_1 = require("@shuvi/runtime-react/dep/react-router-config");
const routes_1 = __importDefault(require("@shuvi-app/routes"));
function App() {
    return react_1.default.createElement(react_1.default.Fragment, null, react_router_config_1.renderRoutes(routes_1.default));
}
exports.default = App;
