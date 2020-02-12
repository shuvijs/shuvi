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
const getWebpackEntries_1 = require("./helpers/getWebpackEntries");
const getWebpackConfig_1 = require("./helpers/getWebpackConfig");
const BuildRequier_1 = __importDefault(require("./helpers/BuildRequier"));
const htmlescape_1 = require("./helpers/htmlescape");
const devServer_1 = __importDefault(require("./dev/devServer"));
const constants_1 = require("./constants");
const routerService_1 = __importDefault(require("./routerService"));
const onDemandRouteManager_1 = require("./onDemandRouteManager");
const runtime_1 = require("./runtime");
const utils_1 = require("./utils");
const defaultConfig = {
    cwd: process.cwd(),
    outputPath: "dist",
    publicPath: "/"
};
class Service {
    constructor({ config }) {
        this._app = core_1.app({
            config: Object.assign(Object.assign({}, defaultConfig), config)
        });
        this._routerService = new routerService_1.default(this._app.paths.pagesDir);
        this._buildRequier = new BuildRequier_1.default({
            buildDir: this._app.paths.buildDir
        });
        this._onDemandRouteManager = new onDemandRouteManager_1.OnDemandRouteManager({ app: this._app });
        this._devServer = null;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._setupApp();
            yield this._app.build({
                bootstrapFilePath: runtime_1.runtime.getBootstrapFilePath()
            });
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
                [constants_1.BUILD_SERVER_DOCUMENT]: ["@shuvi-app/document"],
                [constants_1.BUILD_SERVER_APP]: ["@shuvi-app/app"]
            };
            // console.log("server webpack config:");
            // console.dir(serverConfig, { depth: null });
            const compiler = webpack_1.default([clientConfig, serverConfig]);
            const server = (this._devServer = new devServer_1.default(compiler, {
                port: 4000,
                host: "0.0.0.0",
                publicPath: this._config.publicPath
            }));
            this._onDemandRouteManager.devServer = this._devServer;
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
            server.before(this._onDemandRouteMiddleware.bind(this));
            server.use(this._pageMiddleware.bind(this));
            server.start();
        });
    }
    _setupApp() {
        return __awaiter(this, void 0, void 0, function* () {
            // core files
            const app = this._app;
            app.addSelectorFile("app.js", [app.resolveSrcFile("app.js")], runtime_1.runtime.getAppFilePath());
            app.addSelectorFile("document.js", [app.resolveSrcFile("document.js")], runtime_1.runtime.getDocumentFilePath());
            this._onDemandRouteManager.run(this._routerService);
            // runtime files
            yield runtime_1.runtime.install(this._app);
        });
    }
    get _paths() {
        return this._app.paths;
    }
    get _config() {
        return this._app.config;
    }
    _onDemandRouteMiddleware(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = req.url.match(constants_1.PAGE_STATIC_REGEXP);
            if (!match) {
                return next();
            }
            const routeId = match[1];
            yield this._onDemandRouteManager.activateRoute(routeId);
            next();
        });
    }
    _pageMiddleware(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = req.headers;
            if (req.method !== "GET") {
                return next();
            }
            else if (!headers || typeof headers.accept !== "string") {
                return next();
            }
            else if (headers.accept.indexOf("application/json") === 0) {
                return next();
            }
            else if (!utils_1.acceptsHtml(headers.accept, { htmlAcceptHeaders: ["text/html"] })) {
                return next();
            }
            yield this._onDemandRouteManager.ensureRoutes(req.url || "/");
            try {
                yield this._renderPage(req, res);
            }
            catch (error) {
                console.warn("render fail");
                console.error(error);
            }
            next();
        });
    }
    _renderPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = {
                loadableModules: []
            };
            // TODO: getInitialProps
            const { App } = this._buildRequier.requireApp();
            const loadableManifest = this._buildRequier.getModules();
            const appHtml = yield runtime_1.runtime.renderApp(App, {
                url: req.url || "/",
                context
            });
            const dynamicImportIdSet = new Set();
            const dynamicImports = [];
            for (const mod of context.loadableModules) {
                const manifestItem = loadableManifest[mod];
                if (manifestItem) {
                    manifestItem.forEach(item => {
                        dynamicImports.push(item);
                        dynamicImportIdSet.add(item.id);
                    });
                }
            }
            const documentProps = this._getDocumentProps({
                appHtml,
                dynamicImports,
                dynamicImportIds: [...dynamicImportIdSet]
            });
            const Document = this._buildRequier.requireDocument();
            const html = yield runtime_1.runtime.renderDocument(Document.default || Document, {
                documentProps
            });
            res.end(html);
        });
    }
    _getDocumentProps({ appHtml, dynamicImports, dynamicImportIds }) {
        const styles = [];
        const scripts = [];
        const entrypoints = this._buildRequier.getEntryAssets(constants_1.BUILD_CLIENT_RUNTIME_MAIN);
        entrypoints.forEach((asset) => {
            if (/\.js$/.test(asset)) {
                scripts.push({
                    tagName: "script",
                    attrs: {
                        src: this._app.getPublicUrlPath(asset)
                    }
                });
            }
            else if (/\.css$/.test(asset)) {
                styles.push({
                    tagName: "link",
                    attrs: {
                        rel: "stylesheet",
                        href: this._app.getPublicUrlPath(asset)
                    }
                });
            }
        });
        const preloadDynamicChunks = utils_1.dedupe(dynamicImports, "file").map((bundle) => {
            return {
                tagName: "link",
                attrs: {
                    rel: "preload",
                    href: this._app.getPublicUrlPath(bundle.file),
                    as: "script"
                }
            };
        });
        const inlineAppData = this._getDocumentInlineAppData({
            dynamicIds: dynamicImportIds
        });
        return {
            headTags: [...styles, ...preloadDynamicChunks],
            contentTags: [this._getDocumentContent(appHtml)],
            scriptTags: [inlineAppData, ...scripts]
        };
    }
    _getDocumentInlineAppData(appData) {
        const data = JSON.stringify(appData);
        return {
            tagName: "script",
            attrs: {
                id: constants_1.CLIENT_APPDATA_ID,
                type: "application/json",
                innerHtml: htmlescape_1.htmlEscapeJsonString(data)
            }
        };
    }
    _getDocumentContent(html) {
        return {
            tagName: "div",
            attrs: {
                id: constants_1.CLIENT_CONTAINER_ID,
                innerHtml: html
            }
        };
    }
}
exports.default = Service;
