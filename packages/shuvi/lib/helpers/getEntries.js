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
    const entry = {
        [constants_1.BUILD_CLIENT_RUNTIME_MAIN_PATH]: [constants_1.ENTRY_CLIENT_PATH]
    };
    if (process.env.NODE_ENV === "development") {
        const hotClient = require.resolve("@shuvi/toolpack/lib/utils/webpackHotDevClient");
        entry[constants_1.BUILD_CLIENT_RUNTIME_MAIN_PATH].unshift(`${hotClient}?launchEditorEndpoint=${constants_1.LAUNCH_EDITOR_ENDPOINT}`);
    }
    return entry;
}
exports.getClientEntries = getClientEntries;
function getServerEntries() { }
exports.getServerEntries = getServerEntries;
