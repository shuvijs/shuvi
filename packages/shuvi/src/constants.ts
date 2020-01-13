import { join } from "path";
import { constants } from "@shuvi/core";

const resolveSource = (relativePath: string, ext = "js") =>
  `${join(__dirname, relativePath)}.${ext}`;

export const ResourceType = {
  Component: "shuvi_component",
  Entry: "shuvi_entry"
};

export const ROUTE_PREFIX = `/_${constants.NAME}`;

export const DEV_PUBLIC_PATH = `${ROUTE_PREFIX}/static/webpack`;

export const LAUNCH_EDITOR_ENDPOINT = `${ROUTE_PREFIX}/development/open-stack-frame-in-editor`;

export const BUILD_MEDIA_PATH = "static/media/[name].[hash:8].[ext]";

export const BUILD_MANIFEST_PATH = "build-manifest.json";

const BUILD_CLIENT_DIR = "client";

export const BUILD_CLIENT_RUNTIME_MAIN = `${BUILD_CLIENT_DIR}/runtime/main.js`;

export const BUILD_CLIENT_RUNTIME_WEBPACK = `${BUILD_CLIENT_DIR}/runtime/webpack.js`;

export const CLIENT_ENTRY_PATH = resolveSource("client/index");

const BUILD_SERVER_DIR = "server";

export const BUILD_SERVER_DOCUMENT = `${BUILD_SERVER_DIR}/document.js`;
