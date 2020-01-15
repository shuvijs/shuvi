import { Application } from "@shuvi/core";
// import path from "path";
// import qs from "querystring";
import {
  LAUNCH_EDITOR_ENDPOINT,
  CLIENT_ENTRY_PATH
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

export function getClientEntries(app: Application): string[] {
  const entries = [CLIENT_ENTRY_PATH];

  if (process.env.NODE_ENV === "development") {
    const hotClient = require.resolve(
      "@shuvi/toolpack/lib/utils/webpackHotDevClient"
    );
    entries.unshift(
      `${hotClient}?launchEditorEndpoint=${LAUNCH_EDITOR_ENDPOINT}`
    );
  }

  return entries;
}

export function getServerEntries() {}
