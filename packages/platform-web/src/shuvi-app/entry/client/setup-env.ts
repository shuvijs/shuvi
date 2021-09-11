/**
 * Following codes should be run beforen any other codes.
 * Do not try to import any module from `@shuvi/app`.
 */

import {
  IDENTITY_RUNTIME_PUBLICPATH,
  IDENTITY_SSR_RUNTIME_PUBLICPATH
} from '@shuvi/shared/lib/constants';
import setRuntimeConfig from '@shuvi/app/core/setRuntimeConfig';
import runtimeConfig from '@shuvi/app/core/runtimeConfig';
import { helpers } from '@shuvi/platform-core';

// === set public path ===
declare let __webpack_public_path__: string;

const win = window as any;

// server runtime public path
if (win[IDENTITY_SSR_RUNTIME_PUBLICPATH]) {
  __webpack_public_path__ = win[IDENTITY_SSR_RUNTIME_PUBLICPATH];
}

// client runtime public path
if (win[IDENTITY_RUNTIME_PUBLICPATH]) {
  __webpack_public_path__ = win[IDENTITY_RUNTIME_PUBLICPATH];
}

// === set runtime config ===
const appData = helpers.getAppData();

// build-time config for none-ssr
if (runtimeConfig) {
  setRuntimeConfig(runtimeConfig);
}

// runtime config from server
if (appData.runtimeConfig) {
  setRuntimeConfig(appData.runtimeConfig);
}
