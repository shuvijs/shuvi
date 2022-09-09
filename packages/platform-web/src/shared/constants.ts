export {
  BUNDLER_TARGET_CLIENT,
  BUNDLER_TARGET_SERVER,
  CLIENT_OUTPUT_DIR,
  SERVER_OUTPUT_DIR
} from '@shuvi/shared/lib/constants';

export const CLIENT_BUILD_MANIFEST_PATH = '../build-manifest.client.json';

export const SERVER_BUILD_MANIFEST_PATH = '../build-manifest.server.json';

export const BUILD_CLIENT_RUNTIME_POLYFILLS = `static/polyfills`;

export const BUILD_CLIENT_RUNTIME_POLYFILLS_SYMBOL = Symbol(`polyfills`);

export const BUILD_CLIENT_RUNTIME_WEBPACK = `static/webpack-runtime`;

export const BUILD_CLIENT_RUNTIME_MAIN = `static/main`;

export const BUILD_SERVER_FILE_SERVER = `server`;
