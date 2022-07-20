import '@shuvi/platform-shared/shuvi-type-extensions-node';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IViewServer } from './lib/node/features/html-render/index';
import {
  IMiddlewareRoutes,
  CreateAppServer,
  IApiRoutes,
  IServerModule,
  PlatformWebCustomConfig
} from './esm/shared/index';

export {};

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

declare global {
  namespace ShuviService {
    interface CustomConfig {
      ssr: PlatformWebCustomConfig['ssr'];
      router: PlatformWebCustomConfig['router'];
      routes?: PlatformWebCustomConfig['routes'];
      middlewareRoutes?: PlatformWebCustomConfig['middlewareRoutes'];
      apiRoutes?: PlatformWebCustomConfig['apiRoutes'];
      conventionRoutes: PlatformWebCustomConfig['conventionRoutes'];
    }
  }
}
