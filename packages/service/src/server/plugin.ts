import {
  createAsyncParallelHook,
  createHookManager,
  isPluginInstance,
  HookMap
} from '@shuvi/hook';
import { IRuntimeOrServerPlugin, IPluginContext } from '../core';
import { IServerMiddleware } from './pluginTypes';
import { DevMiddleware } from '../lib/devMiddleware';

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

const serverMiddlewareBeforeDevMiddleware = createAsyncParallelHook<
  void,
  DevMiddleware,
  IServerMiddleware | IServerMiddleware[]
>();
const serverMiddleware = createAsyncParallelHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();
const serverListen =
  createAsyncParallelHook<{ port: number; hostname?: string }>();

const internalHooks = {
  serverMiddlewareBeforeDevMiddleware,
  serverMiddleware,
  serverListen
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

const resolvePlugin = (path: string) => {
  const resolved = require(path);
  return resolved.default || resolved;
};

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: IRuntimeOrServerPlugin[],
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
