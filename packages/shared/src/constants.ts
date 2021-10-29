// common
export const NAME = 'shuvi';

export const CONFIG_FILE = 'shuvi.config.js';

export const PATH_PREFIX = `/_${NAME}`;

export const ROUTE_RESOURCE_QUERYSTRING = `shuvi-route`;

export const PUBLIC_ENV_PREFIX = 'SHUVI_PUBLIC_';

// app
export const CLIENT_CONTAINER_ID = '__APP';

export const CLIENT_APPDATA_ID = '__APP_DATA';

export const DEV_STYLE_ANCHOR_ID = '__shuvi_style_anchor';

export const DEV_STYLE_HIDE_FOUC = 'data-shuvi-hide-fouc';

export const DEV_STYLE_PREPARE = '__shuvi_style_prepare';

export const DEV_HOT_MIDDLEWARE_PATH = `${PATH_PREFIX}/webpack-hmr`;

export const DEV_HOT_LAUNCH_EDITOR_ENDPOINT = `${PATH_PREFIX}/development/open-stack-frame-in-editor`;

export const IDENTITY_RUNTIME_PUBLICPATH = `__${NAME}_public_path__`;

export const IDENTITY_SSR_RUNTIME_PUBLICPATH = `__${NAME}_ssr_public_path__`;

export const ROUTE_NOT_FOUND_NAME = `404`;

export enum SHUVI_ERROR_CODE {
  APP_ERROR = 500, //  对应 server 端的 500
  PAGE_NOT_FOUND = 404 //  对应 server 端的 404
}

export const DEFAULT_ERROR_MESSAGE = {
  [SHUVI_ERROR_CODE.APP_ERROR]: {
    errorDesc: 'Internal Server Error.'
  },
  [SHUVI_ERROR_CODE.PAGE_NOT_FOUND]: {
    errorDesc: 'This page could not be found.'
  }
};

// bundle
export const BUNDLER_TARGET_CLIENT = `${NAME}/client`;

export const BUNDLER_TARGET_SERVER = `${NAME}/server`;
