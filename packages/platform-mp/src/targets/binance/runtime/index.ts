import { mergeReconciler, mergeInternalComponents } from '@tarojs/shared';
import { initNativeApi } from './apis';
import { DeprecatedInput, DeprecatedTextarea } from './components-react';

const hostConfig = {
  initNativeApi: initNativeApi
};
mergeInternalComponents({ DeprecatedInput, DeprecatedTextarea });
mergeReconciler(hostConfig);
