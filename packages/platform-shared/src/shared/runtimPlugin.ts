import {
  createAsyncParallelHook,
  createAsyncSeriesHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  isPluginInstance,
  IPluginInstance,
  IPluginHandlers,
  HookMap
} from '@shuvi/hook';
import { CustomRuntimePluginHooks } from '@shuvi/runtime';
import { createPluginCreator } from '@shuvi/shared/lib/plugins';
import { IAppContext } from './applicationTypes';

export type AppComponent = unknown;

const init = createAsyncParallelHook<void>();
const appContext = createAsyncSeriesHook<IAppContext>();
const appComponent = createAsyncSeriesWaterfallHook<
  AppComponent,
  IAppContext
>();
const dispose = createAsyncParallelHook<void>();

const builtinRuntimePluginHooks = {
  init,
  appComponent,
  appContext,
  dispose
};

export interface BuiltInRuntimePluginHooks extends HookMap {
  init: typeof init;
  appComponent: typeof appComponent;
  appContext: typeof appContext;
  dispose: typeof dispose;
}

export interface RuntimePluginHooks
  extends BuiltInRuntimePluginHooks,
    CustomRuntimePluginHooks {}

export const getManager = () =>
  createHookManager<RuntimePluginHooks, void>(builtinRuntimePluginHooks, false);

export const {
  createPluginBefore: createRuntimePluginBefore,
  createPlugin: createRuntimePlugin,
  createPluginAfter: createRuntimePluginAfter
} = createPluginCreator(getManager());

export type { IPluginInstance, CustomRuntimePluginHooks };

export type PluginManager = ReturnType<typeof getManager>;

export type RuntimePluginInstance = IPluginInstance<RuntimePluginHooks, void>;

export type IRuntimePluginConstructor = IPluginHandlers<
  RuntimePluginHooks,
  void
>;

export type IAppModule = {
  init?: IRuntimePluginConstructor['init'];
  appContext?: IRuntimePluginConstructor['appContext'];
  appComponent?: IRuntimePluginConstructor['appComponent'];
  dispose?: IRuntimePluginConstructor['dispose'];
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
