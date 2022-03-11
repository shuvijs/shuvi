import { ApplicationCreater } from '@shuvi/platform-shared/lib/runtime';
import {
  IApplicationCreaterServerContext,
  IViewServer
} from '@shuvi/platform-shared/lib/runtime';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IApiRoutes, IDocumentModule, IMiddlewareRoutes } from './index';
import { IServerModule } from '../features/server-side-render/hooks';

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
