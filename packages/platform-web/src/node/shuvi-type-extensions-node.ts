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
  addMiddlewareRoutes
} from './features/filesystem-routes/hooks';
import { extendedHooks } from './features/html-render/serverHooks';
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
      middlewareRoutes?: PlatformWebCustomConfig['middlewareRoutes'];
      apiRoutes?: PlatformWebCustomConfig['apiRoutes'];
      conventionRoutes: PlatformWebCustomConfig['conventionRoutes'];
    }
    interface CustomCorePluginHooks {
      addRoutes: typeof addRoutes;
      addMiddlewareRoutes: typeof addMiddlewareRoutes;
      // addAPIRoutes: typeof addAPIRoutes;
    }
    interface CustomServerPluginHooks {
      getPageData: typeof extendedHooks.getPageData;
      handlePageRequest: typeof extendedHooks.handlePageRequest;
      modifyHtml: typeof extendedHooks.modifyHtml;
    }
  }
}
