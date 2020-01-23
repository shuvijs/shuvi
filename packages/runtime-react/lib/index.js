"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const paths_1 = require("./paths");
class ReactRuntime {
    install(app) {
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
        console.log("install react runtime");
    }
    renderDocument(Document, options) {
        return renderer_1.renderDocument(Document, options);
    }
    renderApp(App, options) {
        return renderer_1.renderApp(App, options);
    }
    getDocumentFilePath() {
        return paths_1.resolveSource("document");
    }
    getBootstrapFilePath() {
        return paths_1.resolveSource("bootstrap");
    }
}
exports.default = new ReactRuntime();
