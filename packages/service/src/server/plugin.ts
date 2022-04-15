import {
  createAsyncParallelHook,
  createHookManager,
  HookMap,
  IPluginInstance,
  IPluginHandlers
} from '@shuvi/hook';
import { CustomServerPluginHooks } from '@shuvi/runtime'
import { IPluginContext } from '../core';
import { IProxy } from './pluginTypes';

export * from './pluginTypes';

export type IServerPluginContext = IPluginContext & {
  serverPluginRunner: PluginManager['runner'];
};

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

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
    CustomServerPluginHooks
  >(internalHooks);

export const { createPlugin: createServerPlugin } = getManager();

export type IServerPluginConstructor = IPluginHandlers<
  InternalServerPluginHooks & CustomServerPluginHooks,
  IServerPluginContext
>;

export type ServerPluginInstance = IPluginInstance<
  InternalServerPluginHooks & CustomServerPluginHooks,
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
