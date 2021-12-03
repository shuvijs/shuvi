/* import { manager, hooksMap, isPluginInstance } from './runtimeHooks';
export { hooksMap };
export const { createPlugin, usePlugin, runner } = manager;
export type IRuntimePluginConstructor = Parameters<typeof createPlugin>[0];
export type IRuntimePluginInstance = ArrayItem<Parameters<typeof usePlugin>>;
export type IRuntimePluginWithOptions = (...params: any[]) => IRuntimePluginInstance;
export type IRuntimePlugin = IRuntimePluginInstance | IRuntimePluginWithOptions;
export type IRuntimePluginOptions = Record<string, unknown>;

export type IRuntimeModule = {
  onInit: IRuntimePluginConstructor['init']
  getAppComponent: IRuntimePluginConstructor['appComponent']
  getRootAppComponent: IRuntimePluginConstructor['rootAppComponent']
  getContext: IRuntimePluginConstructor['context']
  onRenderDone: IRuntimePluginConstructor['renderDone']
  onDispose: IRuntimePluginConstructor['dispose']
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
  for (const name in pluginRecord) {
    const { plugin, options } = pluginRecord[name];
    let parsedOptions: any;
    if (options) {
      parsedOptions = JSON.parse(options);
      console.warn('parsedOptions', parsedOptions);
    }
    if (isPluginInstance(plugin)) {
      usePlugin(plugin as IRuntimePluginInstance);
    } else {
      usePlugin((plugin as IRuntimePluginWithOptions)(parsedOptions));
    }
  }
  const pluginConstructor: IRuntimePluginConstructor = {}
  const { onInit, getAppComponent, getRootAppComponent, getContext, onRenderDone, onDispose } = runtimeModule
  if (onInit) pluginConstructor.init = onInit
  if (getAppComponent) pluginConstructor.appComponent = getAppComponent
  if (getRootAppComponent) pluginConstructor.rootAppComponent = getRootAppComponent
  if (getContext) pluginConstructor.context = getContext
  if (onRenderDone) pluginConstructor.renderDone = onRenderDone
  if (onDispose) pluginConstructor.dispose = onDispose
  usePlugin(createPlugin(pluginConstructor));
};
 */
