import { Application } from "@shuvi/core";
// import path from "path";
// import qs from "querystring";
import {
  HOT_LAUNCH_EDITOR_ENDPOINT,
  CLIENT_ENTRY_PATH,
  HOT_MIDDLEWARE_PATH
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
  return entries;
}

export function getServerEntries() {}
