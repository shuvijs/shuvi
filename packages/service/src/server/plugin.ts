import {
  createAsyncParallelHook,
  createHookManager,
  HookMap,
  IPluginInstance
} from '@shuvi/hook';
import { IPluginContext } from '../core';
import { IProxy } from './pluginTypes';

export * from './pluginTypes';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export type IServerPluginContext = IPluginContext & {
  serverPluginRunner: PluginManager['runner'];
};

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

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

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: ServerPluginInstance[],
  pluginContext: IPluginContext
): IServerPluginContext => {
  const serverContext = Object.assign(
    { serverPluginRunner: manager.runner },
    pluginContext
  );
  manager.setContext(serverContext);
  serverPlugins.forEach(plugin => {
    manager.usePlugin(plugin);
  });
  return serverContext;
};
