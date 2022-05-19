/**
 * Following codes should be run beforen any other codes.
 * Do not try to import any module from `@shuvi/app`.
 */

import setRuntimeConfig from '@shuvi/app/core/setRuntimeConfig';
import runtimeConfig from '@shuvi/app/core/runtimeConfig';

// build-time config for none-ssr
if (runtimeConfig) {
  setRuntimeConfig(runtimeConfig);
}
