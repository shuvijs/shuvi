import { createServerPlugin } from '@shuvi/service';
import { server } from '@shuvi/service/lib/resources';

import { IServerMiddleware } from '@shuvi/service';
export interface IServerModule {
  serverMiddleware?: IServerMiddleware | IServerMiddleware[];
}

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule
  };
}

export default createServerPlugin(
  {
    serverMiddleware: () => {
      return server?.server?.serverMiddleware || [];
    },
  },
  { order: -100, name: 'serverModule' }
);

