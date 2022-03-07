import type { PluginManager } from './lifecycle';

type SerializedPluginOptions = string;

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export type IRuntimePluginConstructor = Parameters<
  PluginManager['createPlugin']
>[0];

export type IRuntimePluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type IRuntimePluginOptions = Record<string, unknown>;

export type IRuntimePluginWithOptions = (
  ...params: any[]
) => IRuntimePluginInstance;

export type IRuntimePlugin = IRuntimePluginInstance | IRuntimePluginWithOptions;

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

export type IRuntimeModule = {
  init: IRuntimePluginConstructor['init'];
  // getContext
  getAppContext: IRuntimePluginConstructor['getAppContext'];
  getAppComponent: IRuntimePluginConstructor['getAppComponent'];
  getRootAppComponent: IRuntimePluginConstructor['getRootAppComponent'];
  dispose: IRuntimePluginConstructor['dispose'];
};
