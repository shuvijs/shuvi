import {
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  isPluginInstance,
  IPluginInstance,
  IPluginHandlers
} from '@shuvi/hook';
import { CustomRuntimePluginHooks } from '@shuvi/runtime';
import { IAppContext } from './applicationTypes';

type AppComponent = unknown;

const init = createAsyncParallelHook<void>();
const getAppContext = createAsyncSeriesWaterfallHook<IAppContext, void>();
const getAppComponent = createAsyncSeriesWaterfallHook<
  AppComponent,
  IAppContext
>();
const dispose = createAsyncParallelHook<void>();

const builtinRuntimePluginHooks = {
  init,
  getAppComponent,
  getAppContext,
  dispose
};

type BuiltinRuntimePluginHooks = typeof builtinRuntimePluginHooks;

export const getManager = () =>
  createHookManager<BuiltinRuntimePluginHooks, void, CustomRuntimePluginHooks>(
    builtinRuntimePluginHooks,
    false
  );

export const { createPlugin } = getManager();

export type PluginManager = ReturnType<typeof getManager>;

export type RuntimePluginInstance = IPluginInstance<
  BuiltinRuntimePluginHooks & CustomRuntimePluginHooks,
  void
>;

export type IRuntimePluginConstructor = IPluginHandlers<
  BuiltinRuntimePluginHooks & CustomRuntimePluginHooks,
  void
>;

export type IRuntimeModule = {
  init: IRuntimePluginConstructor['init'];
  getAppContext: IRuntimePluginConstructor['getAppContext'];
  getAppComponent: IRuntimePluginConstructor['getAppComponent'];
  dispose: IRuntimePluginConstructor['dispose'];
};

type SerializedPluginOptions = string;

export type IRuntimePluginOptions = Record<string, unknown>;

export type IRuntimePluginWithOptions = (
  ...params: any[]
) => RuntimePluginInstance;

export type IRuntimePlugin = RuntimePluginInstance | IRuntimePluginWithOptions;

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

export type IPluginList = [IRuntimePlugin, SerializedPluginOptions?][];

export const initPlugins = async (
  pluginManager: PluginManager,
  plugins: IPluginList
) => {
  // clear plugin at development mode every time
  if (process.env.NODE_ENV === 'development') {
    pluginManager.clear();
  }

  for (const [plugin, options] of plugins) {
    let parsedOptions: any;
    if (options) {
      parsedOptions = JSON.parse(options);
    }
    if (isPluginInstance(plugin)) {
      pluginManager.usePlugin(plugin as RuntimePluginInstance);
    } else {
      pluginManager.usePlugin(
        (plugin as IRuntimePluginWithOptions)(parsedOptions)
      );
    }
  }
};
