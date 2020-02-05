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
class RouteWithInitialProps extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            propsPending: typeof props.initialProps === "undefined",
            initialProps: props.initialProps || {}
        };
        this._handleLocationChange = this._handleLocationChange.bind(this);
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const { history } = this.props;
            this._unlisten = history.listen(this._handleLocationChange);
            if (history.action !== "POP") {
                this._getInitialProps();
            }
        });
    }
    componentWillUnmount() {
        this._unlisten();
    }
    _getInitialProps() {
        return __awaiter(this, void 0, void 0, function* () {
            const { match, location, component } = this.props;
            const initialProps = yield component.getInitialProps({
                isServer: false,
                pathname: location.pathname,
                query: match.params
            });
            this.setState({
                initialProps
            });
        });
    }
    _handleLocationChange() {
        this._getInitialProps();
    }
    render() {
        if (this.state.propsPending) {
            return null;
        }
        return react_1.default.createElement(this.props.component, Object.assign(Object.assign({}, this.props), this.state.initialProps));
    }
}
function renderRoutes(routes, initialProps = {}, switchProps = {}) {
    return routes ? (react_1.default.createElement(react_router_dom_1.Switch, Object.assign({}, switchProps), routes.map((route, i) => (react_1.default.createElement(react_router_dom_1.Route, { key: route.key || i, path: route.path, exact: route.exact, strict: route.strict, sensitive: route.sensitive, render: props => {
            const childRoutes = renderRoutes(route.routes, initialProps, {
                location: props.location
            });
            if (route.component) {
                let { component: Component } = route;
                const isBrowser = typeof window !== "undefined";
                if (isBrowser && Component.getInitialProps) {
                    return (react_1.default.createElement(RouteWithInitialProps, Object.assign({}, props, { component: Component }), childRoutes));
                }
                return react_1.default.createElement(Component, Object.assign({}, props), childRoutes);
            }
            return childRoutes;
        } }))))) : null;
}
exports.default = renderRoutes;
