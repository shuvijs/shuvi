"use strict";
/// <reference lib="dom" />
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
const react_router_dom_1 = require("react-router-dom");
const utils_1 = require("../utils");
function withInitialProps(WrappedComponent) {
    var _a;
    const hoc = (_a = class WithInitialProps extends react_1.default.Component {
            constructor(props) {
                super(props);
                const propsResolved = typeof props.initialProps !== "undefined";
                this.state = {
                    propsResolved: propsResolved,
                    initialProps: props.initialProps || {}
                };
                if (!propsResolved) {
                    this._getInitialProps();
                }
            }
            static getSnapshotBeforeUpdate(prevProps) {
                return prevProps.match;
            }
            componentDidUpdate(prevProps) {
                const shallow = false;
                const isUrlChanged = prevProps.match.url !== this.props.match.url;
                if (isUrlChanged) {
                    if (shallow) {
                        const isRouteMatchChange = prevProps.match.path !== this.props.match.path;
                        if (isRouteMatchChange) {
                            this._getInitialProps();
                        }
                    }
                    else {
                        this._getInitialProps();
                    }
                }
            }
            _getInitialProps() {
                return __awaiter(this, void 0, void 0, function* () {
                    const { match, location } = this.props;
                    const initialProps = yield WrappedComponent.getInitialProps({
                        isServer: false,
                        pathname: location.pathname,
                        query: match.params
                    });
                    this.setState({
                        propsResolved: true,
                        initialProps
                    });
                });
            }
            render() {
                if (!this.state.propsResolved) {
                    return null;
                }
                return react_1.default.createElement(WrappedComponent, Object.assign(Object.assign({}, this.props), this.state.initialProps));
            }
        },
        _a.displayName = `WithInitialProps(${utils_1.getDisplayName(WrappedComponent)})`,
        _a);
    if (WrappedComponent.getInitialProps) {
        hoc.getInitialProps = WrappedComponent.getInitialProps;
    }
    return hoc;
}
exports.withInitialProps = withInitialProps;
function renderRoutes(routes, initialProps = {}, switchProps = {}) {
    return routes ? (react_1.default.createElement(react_router_dom_1.Switch, Object.assign({}, switchProps), routes.map((route, i) => (react_1.default.createElement(react_router_dom_1.Route, { key: route.key || i, path: route.path, exact: route.exact, strict: route.strict, sensitive: route.sensitive, render: props => {
            const childRoutes = renderRoutes(route.routes, initialProps, {
                location: props.location
            });
            let { component: Component } = route;
            if (Component) {
                return react_1.default.createElement(Component, Object.assign({}, props), childRoutes);
            }
            return childRoutes;
        } }))))) : null;
}
exports.default = renderRoutes;
