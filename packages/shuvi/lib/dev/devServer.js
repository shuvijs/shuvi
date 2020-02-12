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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forkTsCheckerWebpackPlugin_1 = __importStar(require("@shuvi/toolpack/lib/utils/forkTsCheckerWebpackPlugin"));
const formatWebpackMessages_1 = __importDefault(require("@shuvi/toolpack/lib/utils/formatWebpackMessages"));
const errorOverlayMiddleware_1 = require("@shuvi/toolpack/lib/utils/errorOverlayMiddleware");
const express_1 = __importDefault(require("express"));
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
const constants_1 = require("../constants");
class Server {
    constructor(compiler, config) {
        this._beforeMiddlewares = [];
        this._afterMiddlewares = [];
        this._config = config;
        this._app = express_1.default();
        this._webpackDevMiddleware = webpack_dev_middleware_1.default(compiler, {
            publicPath: this._config.publicPath,
            noInfo: true,
            logLevel: "silent",
            watchOptions: {
                ignored: [/[\\/]\.git[\\/]/, /[\\/]node_modules[\\/]/]
            },
            writeToDisk: true
        });
        this._webpackHotMiddleware = webpack_hot_middleware_1.default(compiler.compilers[0], {
            path: constants_1.HOT_MIDDLEWARE_PATH,
            log: false,
            heartbeat: 2500
        });
    }
    send(action, payload) {
        this._webpackHotMiddleware.publish({ action, data: payload });
    }
    start() {
        const { _app: app } = this;
        this._beforeMiddlewares.forEach(m => {
            this._app.use(m);
        });
        app.use(this._webpackDevMiddleware);
        app.use(this._webpackHotMiddleware);
        app.use(errorOverlayMiddleware_1.createLaunchEditorMiddleware(constants_1.HOT_LAUNCH_EDITOR_ENDPOINT));
        this._afterMiddlewares.forEach(m => {
            this._app.use(m);
        });
        app.listen(this._config.port, this._config.host, err => {
            if (err) {
                return console.log(err);
            }
            console.log("Starting the development server...\n");
        });
    }
    watchCompiler(compiler, { useTypeScript, log, onFirstSuccess }) {
        const name = compiler.options.name;
        let onFirstSuccessHandle = null;
        let isFirstSuccessfulCompile = true;
        let tsMessagesPromise;
        let tsMessagesResolver;
        const _log = (...args) => log(`[${name}]`, ...args);
        compiler.hooks.invalid.tap(`invalid`, () => {
            _log("Compiling...");
        });
        if (useTypeScript) {
            const typescriptFormatter = forkTsCheckerWebpackPlugin_1.createCodeframeFormatter({});
            compiler.hooks.beforeCompile.tap("beforeCompile", () => {
                tsMessagesPromise = new Promise(resolve => {
                    tsMessagesResolver = msgs => resolve(msgs);
                });
            });
            forkTsCheckerWebpackPlugin_1.default.getCompilerHooks(compiler).receive.tap("afterTypeScriptCheck", (diagnostics, lints) => {
                const allMsgs = [...diagnostics, ...lints];
                const format = (message) => {
                    const file = (message.file || "").replace(/\\/g, "/");
                    const formated = typescriptFormatter(message, true);
                    return `${file}\n${formated}`;
                };
                tsMessagesResolver({
                    errors: allMsgs.filter(msg => msg.severity === "error").map(format),
                    warnings: allMsgs
                        .filter(msg => msg.severity === "warning")
                        .map(format)
                });
            });
        }
        // "done" event fires when Webpack has finished recompiling the bundle.
        // Whether or not you have warnings or errors, you will get this event.
        compiler.hooks.done.tap("done", (stats) => __awaiter(this, void 0, void 0, function* () {
            // We have switched off the default Webpack output in WebpackDevServer
            // options so we are going to "massage" the warnings and errors and present
            // them in a readable focused way.
            // We only construct the warnings and errors for speed:
            // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
            const statsData = stats.toJson({
                all: false,
                warnings: true,
                errors: true
            });
            if (useTypeScript && statsData.errors.length === 0) {
                const delayedMsg = setTimeout(() => {
                    _log("Files successfully emitted, waiting for typecheck results...");
                }, 100);
                const messages = yield tsMessagesPromise;
                clearTimeout(delayedMsg);
                if (messages) {
                    if (messages.errors && messages.errors.length > 0) {
                        this.send("errors", messages.errors);
                    }
                    else if (messages.warnings && messages.warnings.length > 0) {
                        this.send("warnings", messages.warnings);
                    }
                }
            }
            const messages = formatWebpackMessages_1.default(statsData);
            const isSuccessful = !messages.errors.length && !messages.warnings.length;
            if (isSuccessful) {
                _log("Compiled successfully!");
                if (isFirstSuccessfulCompile) {
                    if (onFirstSuccessHandle) {
                        clearTimeout(onFirstSuccessHandle);
                    }
                    onFirstSuccessHandle = setTimeout(() => {
                        isFirstSuccessfulCompile = false;
                        onFirstSuccess && onFirstSuccess();
                    }, 1000);
                }
            }
            // If errors exist, only show errors.
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                _log("Failed to compile.\n");
                _log(messages.errors.join("\n\n"));
                return;
            }
            // Show warnings if no errors were found.
            if (messages.warnings.length) {
                _log("Compiled with warnings.\n");
                _log(messages.warnings.join("\n\n"));
            }
        }));
    }
    invalidate() {
        this._webpackDevMiddleware.invalidate();
    }
    waitUntilValid(force = false) {
        const middleware = this._webpackDevMiddleware;
        if (force) {
            // private api
            // we know that there must be a rebuild so it's safe to do this
            middleware.context.state = false;
        }
        return new Promise(resolve => {
            middleware.waitUntilValid(resolve);
        });
    }
    before(handle) {
        this._beforeMiddlewares.push(handle);
        return this._app;
    }
    use(handle) {
        this._afterMiddlewares.push(handle);
        return this._app;
    }
}
exports.default = Server;
