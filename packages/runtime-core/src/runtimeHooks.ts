import {
  createSyncHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup,
  isPluginInstance
} from '@shuvi/hook';
import { IContext } from './application';

const init = createAsyncParallelHook<void>();
const appComponent = createAsyncSeriesWaterfallHook<any, IContext>();
const rootAppComponent = createAsyncSeriesWaterfallHook<any, IContext>();
const context = createAsyncSeriesWaterfallHook<IContext>();
const renderDone = createSyncHook<any>();
const dispose = createAsyncParallelHook<void>();

export const hooksMap = {
  init,
  appComponent,
  rootAppComponent,
  context,
  renderDone,
  dispose
};

export const manager = createHookGroup(hooksMap);
export { isPluginInstance };
