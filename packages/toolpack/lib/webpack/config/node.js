"use strict";
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
const base_1 = require("./base");
const external_1 = require("./parts/external");
function createNodeWebpackChain(_a) {
    var baseOptions = __rest(_a, []);
    const chain = base_1.baseWebpackChain(baseOptions);
    chain.target("node");
    chain.output
        .libraryTarget("commonjs2")
        .chunkFilename(baseOptions.dev ? "[name]" : "[name].[contenthash].js");
    chain.externals(external_1.nodeExternals({ projectRoot: baseOptions.projectRoot }));
    chain.module
        .rule("src")
        .use("babel-loader")
        .tap(options => (Object.assign(Object.assign({}, options), { isNode: true })));
    return chain;
}
exports.createNodeWebpackChain = createNodeWebpackChain;
