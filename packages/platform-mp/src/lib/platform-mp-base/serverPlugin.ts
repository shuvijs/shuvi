import { createSyncHook } from '@shuvi/hook';
import {
  createServerPlugin,
  ServerPluginInstance,
  IServerMiddleware
} from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';
export interface IServerModule {
  middlewares?: IServerMiddleware | IServerMiddleware[];
}

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
  };
}

const addMiddleware = createSyncHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();
export const extendedHooks = {
  addMiddleware
};

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    addMiddleware: typeof addMiddleware;
  }
}

export default createServerPlugin(
  {
    setup: ({ addHooks }) => {
      addHooks(extendedHooks);
    },
    addMiddleware: () => {
      return server?.server?.middlewares || [];
    }
  },
  { name: 'serverModule' }
) as ServerPluginInstance;
