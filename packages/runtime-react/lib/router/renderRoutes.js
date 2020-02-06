"use strict";
/// <reference lib="dom" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
// type Props = RouteComponentProps & {
//   component: RouteComponent<React.ComponentType<any>>;
//   initialProps?: Data;
// };
// class RouteWithInitialProps extends React.Component<
//   Props,
//   { propsResolved: boolean; initialProps: Data }
// > {
//   private _unlisten!: () => void;
//   constructor(props: Props) {
//     super(props);
//     const propsResolved = typeof props.initialProps !== "undefined";
//     this.state = {
//       propsResolved: propsResolved,
//       initialProps: props.initialProps || {}
//     };
//     if (!propsResolved) {
//       this._getInitialProps();
//     }
//     this._handleLocationChange = this._handleLocationChange.bind(this);
//   }
//   async componentDidMount() {
//     const { history } = this.props;
//     this._unlisten = history.listen(this._handleLocationChange);
//     if (history.action !== "POP") {
//       this._getInitialProps();
//     }
//   }
//   componentWillUnmount() {
//     this._unlisten();
//   }
//   private async _getInitialProps() {
//     const { match, location, component } = this.props;
//     const initialProps = await component.getInitialProps!({
//       isServer: false,
//       pathname: location.pathname,
//       query: match.params
//     });
//     this.setState({
//       initialProps
//     });
//   }
//   private _handleLocationChange() {
//     this._getInitialProps();
//   }
//   render() {
//     if (!this.state.propsResolved) {
//       return null;
//     }
//     return React.createElement(this.props.component, {
//       ...this.props,
//       ...this.state.initialProps
//     });
//   }
// }
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
