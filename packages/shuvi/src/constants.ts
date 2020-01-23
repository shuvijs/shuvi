import { join } from "path";
import { ROUTE_PREFIX } from "./shared/constants";

export * from './shared/constants'

const resolveSource = (relativePath: string, ext = "js") =>
  `${join(__dirname, relativePath)}.${ext}`;

export const DEV_PUBLIC_PATH = `${ROUTE_PREFIX}/static/webpack/`;

export const BUILD_MEDIA_PATH = "static/media/[name].[hash:8].[ext]";

export const BUILD_MANIFEST_PATH = "build-manifest.json";

const BUILD_CLIENT_DIR = "client";

export const BUILD_CLIENT_RUNTIME_MAIN = `${BUILD_CLIENT_DIR}/runtime/main.js`;

export const BUILD_CLIENT_RUNTIME_WEBPACK = `${BUILD_CLIENT_DIR}/runtime/webpack.js`;

export const CLIENT_ENTRY_PATH = resolveSource("client/index");

const BUILD_SERVER_DIR = "server";

export const BUILD_SERVER_DOCUMENT = `${BUILD_SERVER_DIR}/document.js`;
