import { IServerMiddleware } from '@shuvi/service';
import { extendedHooks } from './hooks'

export interface IServerModule {
  middlewares?: IServerMiddleware | IServerMiddleware[];
}

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
  };
}

declare module '@shuvi/runtime' {
  export interface CustomServerPluginHooks {
    addMiddleware: typeof extendedHooks.addMiddleware;
  }
}
