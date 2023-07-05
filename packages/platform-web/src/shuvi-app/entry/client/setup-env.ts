/**
 * Following codes should be run before any other codes.
 * Do not try to import any module from `@shuvi/app`.
 */

import setRuntimeConfig from '@shuvi/app/core/setRuntimeConfig';
import runtimeConfig from '@shuvi/app/core/runtimeConfig';
import { getAppData } from '@shuvi/platform-shared/shared';
import { CLIENT_ENTRY } from '@shuvi/shared/constants/trace';
import { clientEntryTrace } from './trace';

clientEntryTrace
  .traceChild(CLIENT_ENTRY.events.SHUVI_CLIENT_ENTRY_START.name)
  .stop();
const setupEnvTrace = clientEntryTrace.traceChild(
  CLIENT_ENTRY.events.SHUVI_CLIENT_SETUP_ENV.name
);
// === set runtime config ===
const appData = getAppData();

// build-time config for none-ssr
if (runtimeConfig) {
  setRuntimeConfig(runtimeConfig);
}

// runtime config from server
if (appData.runtimeConfig) {
  setRuntimeConfig(appData.runtimeConfig);
}
setupEnvTrace.stop();
