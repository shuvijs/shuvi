import { NAME } from "@shuvi/core/lib/constants";

export const CLIENT_CONTAINER_ID = '__APP';

export const CLIENT_APPDATA_ID = '__APP_DATA';

export const ROUTE_PREFIX = `/_${NAME}`;

export const HOT_MIDDLEWARE_PATH = `${ROUTE_PREFIX}/webpack-hmr`;

export const HOT_LAUNCH_EDITOR_ENDPOINT = `${ROUTE_PREFIX}/development/open-stack-frame-in-editor`;
