import { NAME, ROUTE_PREFIX } from "./shared/constants";
import { resolvePackageFile } from "./helpers/paths";

export * from "./shared/constants";

export const WEBPACK_CONFIG_CLIENT = `${NAME}/client`;

export const WEBPACK_CONFIG_SERVER = `${NAME}/server`;

export const DEV_PUBLIC_PATH = `${ROUTE_PREFIX}/static/webpack/`;

export const BUILD_MANIFEST_PATH = "build-manifest.json";

export const BUILD_MEDIA_PATH = "static/media/[name].[hash:8].[ext]";

export const BUILD_CLIENT_DIR = "client";

export const BUILD_CLIENT_RUNTIME_MAIN = `static/runtime/main.js`;

export const BUILD_CLIENT_RUNTIME_WEBPACK = `static/runtime/webpack.js`;

export const CLIENT_ENTRY_PATH = resolvePackageFile("lib/client/index");

export const BUILD_SERVER_DIR = "server";

export const BUILD_SERVER_DOCUMENT = `document.js`;

export const BUILD_SERVER_APP = `app.js`;

export const PAGE_STATIC_REGEXP = new RegExp(
  `^${DEV_PUBLIC_PATH}static/chunks/(page-\\w+)\\.js`
);
