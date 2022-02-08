import { ApplicationCreater } from '@shuvi/runtime-core';
import {
  IApplicationCreaterServerContext,
  IViewServer
} from '@shuvi/platform-core';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IApiRoutes, IDocumentModule, IMiddlewareRoutes } from './index';
import { IServerModule } from '../serverPlugin/hooks'

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
    apiRoutes: IApiRoutes;
    middlewareRoutes: IMiddlewareRoutes;
    application: {
      createApp: ApplicationCreater<IApplicationCreaterServerContext>;
    };
    document: Partial<IDocumentModule>;
    view: IViewServer;
  };
  export const documentPath: string;
  export const clientManifest: IManifest;
  export const serverManifest: IManifest;
}
