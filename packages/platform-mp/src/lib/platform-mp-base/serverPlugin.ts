import { createServerPlugin, ServerPluginInstance } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';

import { IServerMiddleware } from '@shuvi/service';
export interface IServerModule {
  middlewares?: IServerMiddleware | IServerMiddleware[];
}

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
  };
}

export default createServerPlugin(
  {
    addMiddleware: () => {
      return server?.server?.middlewares || [];
    }
  },
  { order: -100, name: 'serverModule' }
) as ServerPluginInstance;
