import {
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  isPluginInstance,
  IPluginInstance
} from '@shuvi/hook';
import { IContext } from './application';
import {
  IRuntimePluginConstructor,
  IRuntimePluginInstance,
  IRuntimePluginWithOptions,
  IPluginRecord,
  IRuntimeModule
} from './lifecycleTypes';

export { IRuntimeModule };

const init = createAsyncParallelHook<void>();
const getAppContext = createAsyncSeriesWaterfallHook<IContext>();
const getAppComponent = createAsyncSeriesWaterfallHook<any, IContext>();
const getRootAppComponent = createAsyncSeriesWaterfallHook<any, IContext>();
const dispose = createAsyncParallelHook<void>();

const hooksMap = {
  init,
  getAppComponent,
  getRootAppComponent,
  getAppContext,
  dispose
};

export const getManager = () => createHookManager(hooksMap, false);

export const { createPlugin } = getManager();

export type PluginManager = ReturnType<typeof getManager>;

export type PluginInstance = IPluginInstance<typeof hooksMap, void>;

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
  const methods: Array<keyof typeof runtimeModule> = [
    'getAppComponent',
    'getRootAppComponent',
    'getAppContext',
    'init',
    'dispose'
  ];

  for (let index = 0; index < methods.length; index++) {
    const method = methods[index];
    if (typeof runtimeModule[method] === 'function') {
      //@ts-ignore
      pluginConstructor[method] = runtimeModule[method];
    }
  }

  pluginManager.usePlugin(pluginManager.createPlugin(pluginConstructor));
};
