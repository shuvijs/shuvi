"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const react_1 = __importDefault(require("react"));
const __1 = __importDefault(require(".."));
class App extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.state = {
            aName: 'dirA',
            a1Name: 'A1',
            createB: false
        };
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState(state => ({
                createB: !state.createB,
                aName: '_dirA',
                a1Name: '_A1'
            }));
        }, 10 * 1000);
    }
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("dir", { name: this.state.aName },
                react_1.default.createElement("file", { name: this.state.a1Name, content: "s" }),
                react_1.default.createElement("dir", { name: "dirA_A" },
                    react_1.default.createElement("file", { name: "A_A1", content: "s" }))),
            this.state.createB && react_1.default.createElement("dir", { name: "dirB" })));
    }
}
__1.default.render(react_1.default.createElement(App, null), path_1.default.join(__dirname, 'test'));
setInterval(() => {
    console.log("keep running");
}, 1000);
