import { NAME, PATH_PREFIX } from '@shuvi/shared/lib/constants';

export * from '@shuvi/shared/lib/constants';

export const BUNDLER_TARGET_CLIENT = `${NAME}/client`;

export const BUNDLER_TARGET_SERVER = `${NAME}/server`;

export const PUBLIC_PATH = `${PATH_PREFIX}/`;

export const BUILD_MANIFEST_PATH = 'build-manifest.json';

export const BUILD_MEDIA_PATH = 'static/media/[name].[hash:8].[ext]';

export const BUILD_CLIENT_DIR = 'client';

export const BUILD_CLIENT_RUNTIME_MAIN = `static/runtime/main.js`;

export const BUILD_CLIENT_RUNTIME_WEBPACK = `static/runtime/webpack.js`;

export const BUILD_CLIENT_RUNTIME_POLYFILL = `static/runtime/polyfill.js`;

export const BUILD_SERVER_DIR = 'server';
