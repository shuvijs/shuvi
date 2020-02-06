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
const utils_1 = require("./utils");
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
                    const { match, location } = this.props;
                    const initialProps = yield WrappedComponent.getInitialProps({
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
function wrapDynamicRouteComp(loader) {
    return () => loader().then(mod => {
        const comp = mod.default || mod;
        return comp.getInitialProps ? withInitialProps(comp) : comp;
    });
}
exports.wrapDynamicRouteComp = wrapDynamicRouteComp;
