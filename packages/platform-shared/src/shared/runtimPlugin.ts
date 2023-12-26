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
import type { ShuviRequest } from '@shuvi/service';
import { CustomRuntimePluginHooks } from '@shuvi/runtime';
import { createPluginCreator } from '@shuvi/shared/plugins';
import { IAppContext } from './applicationTypes';
import { IRouter } from './routerTypes';

export type AppComponent = unknown;
export type AppContextCtx = {
  router: IRouter;
  req?: ShuviRequest;
};

const init = createAsyncParallelHook<void>();
const appContext = createAsyncSeriesHook<IAppContext, AppContextCtx>();
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
  appContext: typeof appContext;
  appComponent: typeof appComponent;
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
} = createPluginCreator<RuntimePluginHooks, void>();

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
