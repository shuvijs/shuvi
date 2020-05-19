// these code must be runned before any other codes
import setRuntimeConfig from '@shuvi/app/core/setRuntimeConfig';
import runtimeConfig from '@shuvi/app/core/runtimeConfig';
import { getAppData } from './lib/getAppData';

const appData = getAppData();

// build-time config for none-ssr
if (runtimeConfig) {
  setRuntimeConfig(runtimeConfig);
}

// runtime config from server
if (appData.runtimeConfig) {
  setRuntimeConfig(appData.runtimeConfig);
}
