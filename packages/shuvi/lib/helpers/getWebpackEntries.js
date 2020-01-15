"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import path from "path";
// import qs from "querystring";
const constants_1 = require("../constants");
// const exportGlobalLoader = require.resolve(
//   "@shuvi/toolpack/lib/webpack/loaders/export-global-loader"
// );
// const withShuviGlobal = (name: string, absolutePath: string) => {
//   return `${exportGlobalLoader}?${qs.stringify({
//     absolutePath,
//     exportName: name,
//     globalName: CLIENT_GLOBAL_NAME
//   })}!`;
// };
function getClientEntries(app) {
    const entries = [constants_1.CLIENT_ENTRY_PATH];
    if (process.env.NODE_ENV === "development") {
        const hotClient = require.resolve("@shuvi/toolpack/lib/utils/webpackHotDevClient");
        entries.unshift(`${hotClient}?launchEditorEndpoint=${constants_1.LAUNCH_EDITOR_ENDPOINT}`);
    }
    return entries;
}
exports.getClientEntries = getClientEntries;
function getServerEntries() { }
exports.getServerEntries = getServerEntries;
