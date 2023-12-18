import {
  createAsyncParallelHook,
  createHookManager,
  createSyncBailHook,
  IPluginInstance,
  IPluginHandlers,
  HookMap
} from '@shuvi/hook';
import { createPluginCreator } from '@shuvi/shared/plugins';
import { IPluginContext } from '../core';
import { CustomServerPluginHooks } from './pluginTypes';
import { IRouter } from '@shuvi/router';
import { ShuviRequest } from './shuviServerTypes';

export * from './pluginTypes';

export interface IServerPluginContext extends IPluginContext {
  serverPluginRunner: PluginManager['runner'];
  appConfig: AppConfig;
  router?: IRouter;
}

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

const listen = createAsyncParallelHook<{ port: number; hostname?: string }>();

type AppConfigCtx = {
  req: ShuviRequest;
};

type AppConfig = {
  router: {
    basename: string;
  };
};
const getAppConfig = createSyncBailHook<void, AppConfigCtx, AppConfig>();

const internalHooks = {
  listen,
  getAppConfig
};

export interface BuiltInServerPluginHooks extends HookMap {
  listen: typeof listen;
  getAppConfig: typeof getAppConfig;
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
      // default appConfig, can be override by setupAppConfigMiddleware
      appConfig: {
        router: {
          basename: ''
        }
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
