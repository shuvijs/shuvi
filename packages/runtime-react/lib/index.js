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
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_config_1 = require("react-router-config");
const renderer_1 = require("./renderer");
const paths_1 = require("./paths");
function serializeRoutes(routes) {
    const res = JSON.stringify(routes);
    // Loadble(() => import("${res.componentFile}"))
    return res.replace(/"componentFile":\w*"([^"]+)"/gi, (match, filePath) => `"component": dynamic(() => import("${filePath}"))`);
}
class ReactRuntime {
    install(app) {
        return __awaiter(this, void 0, void 0, function* () {
            // fix yarn link with react hooks
            if (process.env.SHUVI__SECRET_DO_NOT_USE__LINKED_PACKAGE) {
                const path = require("path");
                const resolveNodeModule = (req) => path.resolve(__dirname, "../../../node_modules", req);
                const BuiltinModule = require("module");
                // Guard against poorly mocked module constructors
                const Module = module.constructor.length > 1 ? module.constructor : BuiltinModule;
                const oldResolveFilename = Module._resolveFilename;
                Module._resolveFilename = function (request, parentModule, isMain, options) {
                    let redirectdRequest = request;
                    // make sure these packages are resolved into project/node_modules/
                    // this only works on server side
                    if (["react", "react-dom"].includes(request)) {
                        redirectdRequest = resolveNodeModule(request);
                    }
                    return oldResolveFilename.call(this, redirectdRequest, parentModule, isMain, options);
                };
            }
            const routeConfig = yield app.getRouterConfig();
            app.addTemplateFile("routes.js", paths_1.resolveTemplate("routes"), {
                routes: serializeRoutes(routeConfig.routes)
            });
            console.log("install react runtime");
        });
    }
    renderDocument(req, res, Document, App, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return renderer_1.renderDocument(req, res, Document, App, options);
        });
    }
    matchRoutes(routes, pathname) {
        return react_router_config_1.matchRoutes(routes, pathname);
    }
    // renderApp(
    //   App: React.ComponentType<any>,
    //   options: Runtime.RenderAppOptions
    // ): string {
    //   return renderApp(App, options);
    // }
    getBootstrapFilePath() {
        return paths_1.resolveRuntime("client/bootstrap");
    }
    getDocumentFilePath() {
        return paths_1.resolveRuntime("server/document");
    }
    getAppFilePath() {
        return paths_1.resolveRuntime("shared/app");
    }
}
exports.default = new ReactRuntime();
