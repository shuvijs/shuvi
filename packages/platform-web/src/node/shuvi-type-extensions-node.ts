import '@shuvi/platform-shared/shuvi-type-extensions-node';
import { IPageRouteRecord } from '@shuvi/platform-shared/shared';
import {
  IManifest,
  IMiddlewareRoutes,
  CreateAppServer,
  IApiRoutes,
  PlatformWebCustomConfig
} from '../shared';
import { IViewServer } from './features/html-render';
import { IServerModule } from './shuvi-runtime-server';
import {
  addRoutes,
  addMiddlewareRoutes,
  addApiRoutes
} from './features/filesystem-routes/hooks';
export {};

declare module '@shuvi/service/lib/resources' {
  export interface IResources {
    server: {
      server: IServerModule;
      pageRoutes: IPageRouteRecord[];
      apiRoutes: IApiRoutes;
      middlewareRoutes: IMiddlewareRoutes;
      application: {
        createApp: CreateAppServer;
      };
      view: IViewServer;
    };
    documentPath: string;
    clientManifest: IManifest;
    serverManifest: IManifest;
  }
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
