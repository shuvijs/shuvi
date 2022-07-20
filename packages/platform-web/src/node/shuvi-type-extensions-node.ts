import {
  CreateAppServer,
  IServerModule,
  IApiRoutes,
  IMiddlewareRoutes
} from '../shared';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IViewServer } from '@shuvi/platform-web/node/features/html-render/index';
import { PlatformWebCustomConfig } from './config';

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

declare module '@shuvi/service/lib/core/apiTypes' {
  interface CustomConfig extends PlatformWebCustomConfig {}
}
