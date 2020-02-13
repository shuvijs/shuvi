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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dynamic_1 = __importDefault(require("./dynamic"));
const utils_1 = require("./utils");
function withInitialPropsServer(WrappedComponent) {
    return (_a) => {
        var { __initialProps } = _a, rest = __rest(_a, ["__initialProps"]);
        return react_1.default.createElement(WrappedComponent, Object.assign(Object.assign({}, rest), __initialProps));
    };
}
function withInitialPropsClient(WrappedComponent) {
    var _a;
    const hoc = (_a = class WithInitialProps extends react_1.default.Component {
            constructor(props) {
                super(props);
                const propsResolved = typeof props.__initialProps !== "undefined";
                this.state = {
                    propsResolved: propsResolved,
                    initialProps: props.__initialProps || {}
                };
                if (!propsResolved) {
                    this._getInitialProps();
                }
            }
            getSnapshotBeforeUpdate(prevProps) {
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
                const _a = this.props, { __initialProps } = _a, rest = __rest(_a, ["__initialProps"]);
                return react_1.default.createElement(WrappedComponent, Object.assign(Object.assign({}, rest), this.state.initialProps));
            }
        },
        _a.displayName = `WithInitialProps(${utils_1.getDisplayName(WrappedComponent)})`,
        _a);
    if (WrappedComponent.getInitialProps) {
        hoc.getInitialProps = WrappedComponent.getInitialProps;
    }
    return hoc;
}
function loadRouteComponent(loader, options) {
    const dynamicComp = dynamic_1.default(() => loader().then(mod => {
        const comp = mod.default || mod;
        if (comp.getInitialProps) {
            dynamicComp.getInitialProps =
                comp.getInitialProps;
            // make getInitialProps work in browser
            if (typeof window !== "undefined") {
                return withInitialPropsClient(comp);
            }
            return withInitialPropsServer(comp);
        }
        return comp;
    }), options);
    return dynamicComp;
}
exports.loadRouteComponent = loadRouteComponent;
