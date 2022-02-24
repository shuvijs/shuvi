import {
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { createPlugin } from '@shuvi/service';
import { IPlugin, IRuntimeConfig } from '@shuvi/service/lib/core';

export const addEntryCode = createAsyncParallelHook<
  void,
  void,
  string | string[]
>();
export const addRuntimePlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IPlugin | IPlugin[]
>();
export const addPolyfill = createAsyncParallelHook<
  void,
  void,
  string | string[]
>();
const modifyRuntimeConfig = createAsyncSeriesWaterfallHook<
  IRuntimeConfig,
  void
>();
export const addHooksPlugin = createPlugin({
  setup: ({ addHooks }) => {
    addHooks({
      addEntryCode,
      addPolyfill,
      addRuntimePlugin,
      modifyRuntimeConfig
    });
  }
});

declare module '@shuvi/service' {
  export interface PluginHooks {
    addEntryCode: typeof addEntryCode;
    addPolyfill: typeof addPolyfill;
    addRuntimePlugin: typeof addRuntimePlugin;
    modifyRuntimeConfig: typeof modifyRuntimeConfig;
  }
}
