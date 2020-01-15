"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
let DISABLE_LIFECYCLE = false;
function swtichOffLifeCycle() {
    DISABLE_LIFECYCLE = true;
}
exports.swtichOffLifeCycle = swtichOffLifeCycle;
function swtichOnLifeCycle() {
    DISABLE_LIFECYCLE = false;
}
exports.swtichOnLifeCycle = swtichOnLifeCycle;
class BaseComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        if (DISABLE_LIFECYCLE) {
            this.componentDidCatch = undefined;
            this.componentDidMount = undefined;
            this.componentDidUpdate = undefined;
            this.componentWillMount = undefined;
            this.componentWillReceiveProps = undefined;
            this.componentWillUnmount = undefined;
            this.componentWillUpdate = undefined;
            this.getSnapshotBeforeUpdate = undefined;
            this.UNSAFE_componentWillMount = undefined;
            this.UNSAFE_componentWillReceiveProps = undefined;
            this.UNSAFE_componentWillUpdate = undefined;
            this.shouldComponentUpdate = () => false;
            this.setState = newState => {
                if (typeof newState === "function") {
                    newState = newState(this.state, this.props, this.context);
                }
                this.state = Object.assign({}, this.state, newState);
            };
        }
    }
}
exports.BaseComponent = BaseComponent;
