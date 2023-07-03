import {
  createAsyncParallelHook,
  createHookManager,
  IPluginInstance,
  IPluginHandlers,
  HookMap
} from '@shuvi/hook';
import { createPluginCreator } from '@shuvi/shared/plugins';
import { IPluginContext } from '../core';
import { CustomServerPluginHooks } from './pluginTypes';
import { Span, trace } from '../trace';

export * from './pluginTypes';

export interface IServerPluginContext extends IPluginContext {
  serverPluginRunner: PluginManager['runner'];
  traces: {
    serverCreateAppTrace: Span;
    serverRequestTrace: Span;
  };
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
  createHookManager<ServerPluginHooks, IServerPluginContext>(
    internalHooks as ServerPluginHooks
  );

export const {
  createPluginBefore: createServerPluginBefore,
  createPlugin: createServerPlugin,
  createPluginAfter: createServerPluginAfter
} = createPluginCreator<ServerPluginHooks, IServerPluginContext>();

export type ServerPluginConstructor = IPluginHandlers<
  ServerPluginHooks,
  IServerPluginContext
>;

export type ServerPluginInstance = IPluginInstance<
  ServerPluginHooks,
  IServerPluginContext
>;

export type ServerPluginFactory = (options: any) => ServerPluginInstance;

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: ServerPluginInstance[],
  pluginContext: IPluginContext
): IServerPluginContext => {
  const serverContext = Object.assign(
    {
      serverPluginRunner: manager.runner,
      traces: {
        serverCreateAppTrace: trace('SERVER_CREATE_APP'),
        serverRequestTrace: trace('SERVER_REQUEST')
      }
    },
    pluginContext
  );
  manager.setContext(serverContext);
  serverPlugins.forEach(plugin => {
    manager.usePlugin(plugin);
  });
  return serverContext;
};
