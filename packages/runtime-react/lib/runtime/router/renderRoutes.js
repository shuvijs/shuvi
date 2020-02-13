"use strict";
/// <reference lib="dom" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
function renderRoutes(routes, initialProps = {}, switchProps = {}) {
    return routes ? (react_1.default.createElement(react_router_dom_1.Switch, Object.assign({}, switchProps), routes.map((route, i) => (react_1.default.createElement(react_router_dom_1.Route, { key: route.key || i, path: route.path, exact: route.exact, strict: route.strict, sensitive: route.sensitive, render: props => {
            const childRoutes = renderRoutes(route.routes, initialProps, {
                location: props.location
            });
            let { component: Component } = route;
            if (Component) {
                return (react_1.default.createElement(Component, Object.assign({ __initialProps: initialProps[route.id] }, props), childRoutes));
            }
            return childRoutes;
        } }))))) : null;
}
exports.default = renderRoutes;
