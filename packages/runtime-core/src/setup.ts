import setRuntimeConfig from '@shuvi/app/core/setRuntimeConfig';
import { getAppData } from './lib/getAppData';

const appData = getAppData();

// must be called before any code runs
setRuntimeConfig(appData.runtimeConfig || {});
