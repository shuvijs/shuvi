"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const paths_1 = require("./paths");
class ReactRuntime {
    install(app) {
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
