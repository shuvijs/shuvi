/**
 * Following codes should be run beforen any other codes.
 * Do not try to import any module from `@shuvi/app`.
 */

import {
  IDENTITY_RUNTIME_PUBLICPATH,
  IDENTITY_SSR_RUNTIME_PUBLICPATH
} from '@shuvi/shared/lib/constants';
import setRuntimeConfig from '@shuvi/app/files/setRuntimeConfig';
import runtimeConfig from '@shuvi/app/files/runtimeConfig';

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

// build-time config for none-ssr
if (runtimeConfig) {
  setRuntimeConfig(runtimeConfig);
}
