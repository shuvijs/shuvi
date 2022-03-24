import {
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { createPlugin } from '@shuvi/service';
import { IRuntimeConfig } from '@shuvi/service/lib/core';
import path from 'path';

export const addEntryCode = createAsyncParallelHook<
  void,
  void,
  string | string[]
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

const runtimeConfigPath = path.resolve(__dirname, '..', 'lib/runtimeConfig');

export const sharedPlugin = createPlugin({
  setup: ({ addHooks }) => {
    addHooks({
      addEntryCode,
      addPolyfill,
      modifyRuntimeConfig
    });
  },
  addRuntimeService: () => ({
    source: runtimeConfigPath,
    exported: '{ default as getRuntimeConfig }'
  })
});

declare module '@shuvi/service' {
  export interface PluginHooks {
    addEntryCode: typeof addEntryCode;
    addPolyfill: typeof addPolyfill;
    modifyRuntimeConfig: typeof modifyRuntimeConfig;
  }
}
