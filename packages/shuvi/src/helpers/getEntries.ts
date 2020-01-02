import { Application } from "@shuvi/core";
// import path from "path";
// import qs from "querystring";
import {
  LAUNCH_EDITOR_ENDPOINT,
  BUILD_CLIENT_RUNTIME_MAIN_PATH,
  ENTRY_CLIENT_PATH
  // CLIENT_GLOBAL_NAME
} from "../constants";

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

export function getClientEntries(app: Application): { [x: string]: string[] } {
  const entry = {
    [BUILD_CLIENT_RUNTIME_MAIN_PATH]: [ENTRY_CLIENT_PATH]
  };

  if (process.env.NODE_ENV === "development") {
    const hotClient = require.resolve(
      "@shuvi/toolpack/lib/utils/webpackHotDevClient"
    );
    entry[BUILD_CLIENT_RUNTIME_MAIN_PATH].unshift(
      `${hotClient}?launchEditorEndpoint=${LAUNCH_EDITOR_ENDPOINT}`
    );
  }

  return entry;
}

export function getServerEntries() {}
