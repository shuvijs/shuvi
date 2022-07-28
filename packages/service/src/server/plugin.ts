import {
  createAsyncParallelHook,
  createHookManager,
  IPluginInstance,
  IPluginHandlers,
  HookMap
} from '@shuvi/hook';
import { IPluginContext } from '../core';
import { CustomServerPluginHooks } from './pluginTypes';

export * from './pluginTypes';

export interface IServerPluginContext extends IPluginContext {
  serverPluginRunner: PluginManager['runner'];
}

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

const listen = createAsyncParallelHook<{ port: number; hostname?: string }>();

const internalHooks = {
  listen
};

export interface BuiltInServerPluginHooks extends HookMap {
  listen: typeof listen;
}

export interface ServerPluginHooks
  extends BuiltInServerPluginHooks,
    CustomServerPluginHooks {}

export const getManager = () =>
  createHookManager<
    BuiltInServerPluginHooks,
    IServerPluginContext,
    CustomServerPluginHooks
  >(internalHooks);

export const { createPlugin: createServerPlugin } = getManager();

export type ServerPluginConstructor = IPluginHandlers<
  ServerPluginHooks,
  IServerPluginContext
>;

export type ServerPluginInstance = IPluginInstance<
  ServerPluginHooks,
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
