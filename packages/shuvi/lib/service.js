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
const webpack_1 = __importDefault(require("webpack"));
const core_1 = require("@shuvi/core");
const typeScript_1 = require("@shuvi/toolpack/lib/utils/typeScript");
const runtime_react_1 = __importDefault(require("@shuvi/runtime-react"));
const fsRouterService_1 = __importDefault(require("./services/fsRouterService"));
const getWebpackEntries_1 = require("./helpers/getWebpackEntries");
const getWebpackConfig_1 = require("./helpers/getWebpackConfig");
const constants_1 = require("./constants");
const server_1 = __importDefault(require("./server"));
const defaultConfig = {
    cwd: process.cwd(),
    outputPath: "dist",
    publicPath: "/"
};
class Service {
    constructor({ config }) {
        this._app = core_1.app({ config: Object.assign(Object.assign({}, defaultConfig), config) });
        this._routerService = new fsRouterService_1.default();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this._setupRuntime();
            const clientConfig = getWebpackConfig_1.getWebpackConfig(this._app, { node: false });
            clientConfig.name = "client";
            clientConfig.entry = {
                [constants_1.BUILD_CLIENT_RUNTIME_MAIN]: getWebpackEntries_1.getClientEntries(this._app)
            };
            // console.log("client webpack config:");
            // console.dir(clientConfig, { depth: null });
            const { useTypeScript } = typeScript_1.getProjectInfo(this._paths.projectDir);
            const serverConfig = getWebpackConfig_1.getWebpackConfig(this._app, { node: true });
            serverConfig.name = "server";
            serverConfig.entry = {
                [constants_1.BUILD_SERVER_DOCUMENT]: ["@shuvi-app/document"]
            };
            console.log("client webpack config:");
            console.dir(serverConfig, { depth: null });
            const compiler = webpack_1.default([clientConfig, serverConfig]);
            const server = new server_1.default(compiler, {
                port: 4000,
                host: "0.0.0.0",
                publicPath: this._config.publicPath
            });
            let count = 0;
            const onFirstSuccess = () => {
                if (++count >= 2) {
                    console.log(`app in running on: http://localhost:4000`);
                }
            };
            server.watchCompiler(compiler.compilers[0], {
                useTypeScript,
                log: console.log.bind(console),
                onFirstSuccess
            });
            server.watchCompiler(compiler.compilers[1], {
                useTypeScript: false,
                log: console.log.bind(console),
                onFirstSuccess
            });
            server.use(this._handlePage.bind(this));
            yield this._app.build({
                bootstrapSrc: runtime_react_1.default.getBootstrapFilePath()
            });
            server.start();
        });
    }
    _setupRuntime() {
        this._app.addSelectorFile("document.js", [this._app.getSrcPath("document.js")], runtime_react_1.default.getDocumentFilePath());
    }
    get _paths() {
        return this._app.paths;
    }
    get _config() {
        return this._app.config;
    }
    _handlePage(req, res, next) {
        if (req.method.toLowerCase() !== "get") {
            return next();
        }
        const tags = this._getDocumentTags();
        console.debug("tags", tags);
        const Document = require(this._app.getOutputPath(constants_1.BUILD_SERVER_DOCUMENT));
        const html = runtime_react_1.default.renderDocument(Document.default || Document, {
            appData: {},
            documentProps: {
                appHtml: "",
                bodyTags: tags.bodyTags,
                headTags: tags.headTags
            }
        });
        res.end(html);
    }
    _getDocumentTags() {
        const assetsMap = require(this._app.getOutputPath(constants_1.BUILD_MANIFEST_PATH));
        const entrypoints = assetsMap.entries[constants_1.BUILD_CLIENT_RUNTIME_MAIN];
        const bodyTags = [];
        const headTags = [];
        entrypoints.forEach((asset) => {
            if (/\.js$/.test(asset)) {
                bodyTags.push({
                    tagName: "script",
                    attrs: {
                        src: this._app.getPublicPath(asset)
                    }
                });
            }
            else if (/\.css$/.test(asset)) {
                headTags.push({
                    tagName: "link",
                    attrs: {
                        rel: "stylesheet",
                        href: this._app.getPublicPath(asset)
                    }
                });
            }
        });
        return {
            bodyTags,
            headTags
        };
    }
    _startServer() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = Service;
