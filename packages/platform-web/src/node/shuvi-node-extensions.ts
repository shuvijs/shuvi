import {
  CreateAppServer,
  IServerModule,
  IApiRoutes,
  IMiddlewareRoutes
} from '../shared';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IViewServer } from './features/html-render';

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
    apiRoutes: IApiRoutes;
    middlewareRoutes: IMiddlewareRoutes;
    application: {
      createApp: CreateAppServer;
    };
    view: IViewServer;
  };
  export const documentPath: string;
  export const clientManifest: IManifest;
  export const serverManifest: IManifest;
}

declare module '@shuvi/runtime' {
  export interface CustomConfig {
    ssr?: boolean;
  }
}
