import {
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { IRuntimeConfig } from '../../../../shared';

const addEntryCode = createAsyncParallelHook<void, void, string | string[]>();
const modifyRuntimeConfig = createAsyncSeriesWaterfallHook<
  {
    publicRuntimeConfig: IRuntimeConfig;
    serverRuntimeConfig: IRuntimeConfig;
  },
  void
>();

export const extendedHooks = {
  addEntryCode,
  modifyRuntimeConfig
};
