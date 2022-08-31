import '@shuvi/platform-shared/shuvi-type-extensions-node';
import { IPageRouteRecord } from '@shuvi/platform-shared/shared';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import {
  IMiddlewareRoutes,
  CreateAppServer,
  IApiRoutes,
  IServerModule,
  PlatformWebCustomConfig
} from '../shared/index';
import { IViewServer } from './features/html-render/index';
import {
  addRoutes,
  addMiddlewareRoutes,
  addApiRoutes
} from './features/filesystem-routes/hooks';
export {};

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
    pageRoutes: IPageRouteRecord[];
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
      // apiRoutes?: PlatformWebCustomConfig['apiRoutes'];
      // middlewareRoutes?: PlatformWebCustomConfig['middlewareRoutes'];
      conventionRoutes: PlatformWebCustomConfig['conventionRoutes'];
    }
    interface CustomCorePluginHooks {
      addRoutes: typeof addRoutes;
      addMiddlewareRoutes: typeof addMiddlewareRoutes;
      addApiRoutes: typeof addApiRoutes;
    }
  }
}
