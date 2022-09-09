// common
export const NAME = 'shuvi';

export const DEV_ONLY_ASSETS_PREFIX = `/_${NAME}`;

export const ROUTE_RESOURCE_QUERYSTRING = `shuvi-route`;

export const PUBLIC_ENV_PREFIX = 'SHUVI_PUBLIC_';

// app
export const CLIENT_CONTAINER_ID = '__APP';

export const CLIENT_APPDATA_ID = '__APP_DATA';

export const DEV_STYLE_ANCHOR_ID = '__shuvi_style_anchor';

export const DEV_STYLE_HIDE_FOUC = 'data-shuvi-hide-fouc';

export const DEV_HOT_MIDDLEWARE_PATH = `${DEV_ONLY_ASSETS_PREFIX}/webpack-hmr`;

export const DEV_HOT_LAUNCH_EDITOR_ENDPOINT = `${DEV_ONLY_ASSETS_PREFIX}/development/open-stack-frame-in-editor`;

export const DEV_ORIGINAL_STACK_FRAME_ENDPOINT = `${DEV_ONLY_ASSETS_PREFIX}/development/original-stack-frame`;

export const DEV_SOCKET_TIMEOUT_MS = 5000;

export const ROUTE_NOT_FOUND_NAME = `404`;

export const SHUVI_ERROR = {
  APP_ERROR: {
    code: 500,
    message: 'Internal Application Error.'
  },
  PAGE_NOT_FOUND: {
    code: 404,
    message: 'This page could not be found.'
  }
};

export const BUNDLER_TARGET_CLIENT = `${NAME}/client`;

export const BUNDLER_TARGET_SERVER = `${NAME}/server`;

export const CLIENT_OUTPUT_DIR = 'client';

export const SERVER_OUTPUT_DIR = 'server';
