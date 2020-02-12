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
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_config_1 = require("react-router-config");
const renderer_1 = require("./renderer");
const paths_1 = require("./paths");
function serializeRoutes(routes) {
    let res = "";
    for (let index = 0; index < routes.length; index++) {
        const _a = routes[index], { routes: childRoutes } = _a, route = __rest(_a, ["routes"]);
        if (childRoutes && childRoutes.length > 0) {
            serializeRoutes(childRoutes);
        }
        let strRoute = "";
        const keys = Object.keys(route);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if (key === "componentFile") {
                const filepath = route[key];
                strRoute += "component: ";
                strRoute += `
loadRouteComponent(() => import(/* webpackChunkName: "${route.id}" */"${filepath}"), {
  webpack: () => [require.resolveWeak("${filepath}")],
  modules: ["${filepath}"],
})`.trim();
            }
            else {
                strRoute += `${key}: ${JSON.stringify(route[key])}`;
            }
            strRoute += `,\n`;
        }
        res += `{${strRoute}},\n`;
    }
    return `[${res}]`;
    //   return res.replace(/"componentFile":\w*"([^"]+)"/gi, (_match, filePath) => {
    //     const routeComponent = `
    // loadRouteComponent(() => import(/* webpackChunkName: "" */"${filePath}"), {
    //   webpack: () => [require.resolveWeak("${filePath}")],
    //   modules: ["${filePath}"],
    // })`.trim();
    //     const routeComponent = `
    // dynamic(() => import("${filePath}"))`.trim();
    // return `"component": ${routeComponent}`;
    // });
}
class ReactRuntime {
    install(app) {
        return __awaiter(this, void 0, void 0, function* () {
            // fix yarn link with react hooks
            if (process.env.SHUVI__SECRET_DO_NOT_USE__LINKED_PACKAGE) {
                const path = require("path");
                const resolveNodeModule = (req) => path.resolve(__dirname, "../../../../node_modules", req);
                const BuiltinModule = require("module");
                // Guard against poorly mocked module constructors
                const Module = module.constructor.length > 1 ? module.constructor : BuiltinModule;
                const oldResolveFilename = Module._resolveFilename;
                Module._resolveFilename = function (request, parentModule, isMain, options) {
                    let redirectdRequest = request;
                    // make sure these packages are resolved into project/node_modules/
                    // this only works on server side
                    if (["react", "react-dom", "react-router-dom"].includes(request)) {
                        redirectdRequest = resolveNodeModule(request);
                    }
                    return oldResolveFilename.call(this, redirectdRequest, parentModule, isMain, options);
                };
            }
            console.log("install react runtime");
        });
    }
    renderDocument(Document, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return renderer_1.renderDocument(Document, options);
        });
    }
    renderApp(App, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return renderer_1.renderApp(App, options);
        });
    }
    generateRoutesSource(routes) {
        const routesExport = serializeRoutes(routes);
        return `
import { loadRouteComponent } from '@shuvi/runtime-react/lib/runtime/loadRouteComponent';
export default ${routesExport}
`.trim();
    }
    matchRoutes(routes, pathname) {
        return react_router_config_1.matchRoutes(routes, pathname);
    }
    getDocumentFilePath() {
        return paths_1.resolveDistFile("client/document");
    }
    getBootstrapFilePath() {
        return paths_1.resolveDistFile("client/bootstrap");
    }
    getAppFilePath() {
        return paths_1.resolveDistFile("client/app");
    }
}
exports.default = new ReactRuntime();
