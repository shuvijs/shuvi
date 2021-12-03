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

const hooksMap = {
  init,
  appComponent,
  rootAppComponent,
  context,
  renderDone,
  dispose
};

export const manager = createHookGroup(hooksMap);
export { isPluginInstance };
export const { createPlugin, usePlugin, runner, hooks, clear } = manager;
export type IRuntimePluginConstructor = Parameters<typeof createPlugin>[0];
export type IRuntimePluginInstance = ArrayItem<Parameters<typeof usePlugin>>;
export type IRuntimePluginWithOptions = (
  ...params: any[]
) => IRuntimePluginInstance;
export type IRuntimePlugin = IRuntimePluginInstance | IRuntimePluginWithOptions;
export type IRuntimePluginOptions = Record<string, unknown>;

export type IRuntimeModule = {
  onInit: IRuntimePluginConstructor['init'];
  getAppComponent: IRuntimePluginConstructor['appComponent'];
  getRootAppComponent: IRuntimePluginConstructor['rootAppComponent'];
  getContext: IRuntimePluginConstructor['context'];
  onRenderDone: IRuntimePluginConstructor['renderDone'];
  onDispose: IRuntimePluginConstructor['dispose'];
};

export type IPluginModule = {
  plugin: IRuntimePlugin;
  pluginOptions: IRuntimePluginOptions;
};
export type IPluginRecord = {
  [name: string]: {
    plugin: IRuntimePlugin;
    options: SerializedPluginOptions;
  };
};
type SerializedPluginOptions = string;

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export const initPlugins = async (
  runtimeModule: Partial<IRuntimeModule>, // 内联plugin，不含options
  pluginRecord: IPluginRecord // 外部plugin
) => {
  // clear plugin at development mode every time
  if (process.env.NODE_ENV === 'development') {
    clear();
  }
  for (const name in pluginRecord) {
    const { plugin, options } = pluginRecord[name];
    let parsedOptions: any;
    if (options) {
      parsedOptions = JSON.parse(options);
    }
    if (isPluginInstance(plugin)) {
      usePlugin(plugin as IRuntimePluginInstance);
    } else {
      usePlugin((plugin as IRuntimePluginWithOptions)(parsedOptions));
    }
  }
  const pluginConstructor: IRuntimePluginConstructor = {};
  const {
    onInit,
    getAppComponent,
    getRootAppComponent,
    getContext,
    onRenderDone,
    onDispose
  } = runtimeModule;
  if (onInit) pluginConstructor.init = onInit;
  if (getAppComponent) pluginConstructor.appComponent = getAppComponent;
  if (getRootAppComponent)
    pluginConstructor.rootAppComponent = getRootAppComponent;
  if (getContext) pluginConstructor.context = getContext;
  if (onRenderDone) pluginConstructor.renderDone = onRenderDone;
  if (onDispose) pluginConstructor.dispose = onDispose;
  usePlugin(createPlugin(pluginConstructor));
};
