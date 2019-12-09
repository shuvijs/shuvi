import { constants } from "@shuvi/core";

export const ROUTE_PREFIX = `/_${constants.NAME}`;

export const LAUNCH_EDITOR_ENDPOINT = `${ROUTE_PREFIX}/development/open-stack-frame-in-editor`;

export const BUILD_MEDIA_PATH = "static/media/[name].[hash:8].[ext]";

export const BUILD_MANIFEST_PATH = "build-manifest.json";
