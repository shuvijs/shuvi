import {
  createAsyncParallelHook,
  createHookManager,
  isPluginInstance,
  HookMap,
  IPluginInstance
} from '@shuvi/hook';
import { IPlugin, IPluginContext } from '../core';
import { IProxy } from './pluginTypes';

export * from './pluginTypes';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export type IServerPluginContext = IPluginContext & {
  serverPluginRunner: PluginManager['runner'];
};

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export type CreatePlugin = PluginManager['createPlugin'];

export type IServerPluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type IServerPluginConstructor = ArrayItem<
  Parameters<PluginManager['createPlugin']>[0]
>;

const onListen = createAsyncParallelHook<{ port: number; hostname?: string }>();

const addProxy = createAsyncParallelHook<void, void, IProxy>();

const internalHooks = {
  addProxy,
  onListen
};

export type InternalServerPluginHooks = typeof internalHooks;

export interface ServerPluginHooks extends HookMap {}

export const getManager = () =>
  createHookManager<
    InternalServerPluginHooks,
    IServerPluginContext,
    ServerPluginHooks
  >(internalHooks);

export const { createPlugin: createServerPlugin } = getManager();

export type ServerPluginInstance = IPluginInstance<
  InternalServerPluginHooks & ServerPluginHooks,
  IServerPluginContext
>;

const resolvePlugin = (path: string) => {
  const resolved = require(path);
  return resolved.default || resolved;
};

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: IPlugin[],
  pluginContext: IPluginContext
): IServerPluginContext => {
  const serverContext = Object.assign(
    { serverPluginRunner: manager.runner },
    pluginContext
  );
  manager.setContext(serverContext);
  serverPlugins.forEach(({ plugin, options }) => {
    const resolved = resolvePlugin(plugin);
    let pluginInstance: IServerPluginInstance | undefined;
    if (isPluginInstance(resolved)) {
      pluginInstance = resolved;
    } else if (typeof resolved === 'function') {
      const pluginByOptions = resolved(options || {});
      if (isPluginInstance(pluginByOptions)) {
        pluginInstance = pluginByOptions;
      }
    }
    if (pluginInstance) {
      manager.usePlugin(pluginInstance);
    } else {
      throw new Error(`serverPlugin load failed. path: ${plugin}`);
    }
  });
  return serverContext;
};

export const normalizePlugin = (x: string | IPlugin): IPlugin => {
  if (typeof x === 'string') {
    return {
      plugin: x
    };
  }
  return x;
};
