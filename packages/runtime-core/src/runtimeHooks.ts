import {
  createSyncHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
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

export const getManager = () => createHookManager(hooksMap, false);
export { isPluginInstance };
export type PluginManager = ReturnType<typeof getManager>;

export const { createPlugin } = getManager();

export type IRuntimePluginConstructor = Parameters<
  PluginManager['createPlugin']
>[0];
export type IRuntimePluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;
export type IRuntimePluginWithOptions = (
  ...params: any[]
) => IRuntimePluginInstance;
export type IRuntimePlugin = IRuntimePluginInstance | IRuntimePluginWithOptions;
export type IRuntimePluginOptions = Record<string, unknown>;

export type IRuntimeModule = {
  getAppComponent: IRuntimePluginConstructor['appComponent'];
  getRootAppComponent: IRuntimePluginConstructor['rootAppComponent'];
  getContext: IRuntimePluginConstructor['context'];
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
  pluginManager: PluginManager,
  runtimeModule: Partial<IRuntimeModule>, // 内联plugin，不含options
  pluginRecord: IPluginRecord // 外部plugin
) => {
  // clear plugin at development mode every time
  if (process.env.NODE_ENV === 'development') {
    pluginManager.clear();
  }
  for (const name in pluginRecord) {
    const { plugin, options } = pluginRecord[name];
    let parsedOptions: any;
    if (options) {
      parsedOptions = JSON.parse(options);
    }
    if (isPluginInstance(plugin)) {
      pluginManager.usePlugin(plugin as IRuntimePluginInstance);
    } else {
      pluginManager.usePlugin(
        (plugin as IRuntimePluginWithOptions)(parsedOptions)
      );
    }
  }
  const pluginConstructor: IRuntimePluginConstructor = {};
  const { getAppComponent, getRootAppComponent, getContext } = runtimeModule;
  if (getAppComponent) pluginConstructor.appComponent = getAppComponent;
  if (getRootAppComponent)
    pluginConstructor.rootAppComponent = getRootAppComponent;
  if (getContext) pluginConstructor.context = getContext;
  pluginManager.usePlugin(pluginManager.createPlugin(pluginConstructor));
};
