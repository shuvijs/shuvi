import { manager, hooksMap, isPluginInstance } from './runtimeHooks';
export { hooksMap };
export const { createPlugin, usePlugin, runner } = manager;
export type ICliPluginConstructor = Parameters<typeof createPlugin>[0];
export type ICliPluginInstance = ArrayItem<Parameters<typeof usePlugin>>;
export type ICliPluginWithOptions = (...params: any[]) => ICliPluginInstance;
export type ICliPlugin = ICliPluginInstance | ICliPluginWithOptions;
export type ICliPluginOptions = Record<string, unknown>;

export type IRuntimeModule = ICliPluginConstructor;

export type IPluginModule = {
  plugin: ICliPlugin;
  pluginOptions: ICliPluginOptions;
};
export type IPluginRecord = {
  [name: string]: {
    plugin: ICliPlugin;
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
      usePlugin(plugin as ICliPluginInstance);
    } else {
      usePlugin((plugin as ICliPluginWithOptions)(parsedOptions));
    }
  }
  console.warn('usePLugin runtime');
  usePlugin(createPlugin(runtimeModule));
};
