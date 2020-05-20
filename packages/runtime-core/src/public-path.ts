import {
  IDENTITY_RUNTIME_PUBLICPATH,
  IDENTITY_SSR_RUNTIME_PUBLICPATH
} from '@shuvi/shared/lib/constants';

const win = window as any;

declare let __webpack_public_path__: string;

// server runtime public path
if (win[IDENTITY_SSR_RUNTIME_PUBLICPATH]) {
  __webpack_public_path__ = win[IDENTITY_SSR_RUNTIME_PUBLICPATH];
}

// client runtime public path
if (win[IDENTITY_RUNTIME_PUBLICPATH]) {
  __webpack_public_path__ = win[IDENTITY_RUNTIME_PUBLICPATH];
}
