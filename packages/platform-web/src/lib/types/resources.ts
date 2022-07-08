import {
  IRequestHandlerWithNext,
  IServerMiddleware,
  ServerPluginConstructor
} from '@shuvi/service';
import { CreateServerApp } from '@shuvi/platform-shared/lib/runtime';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IViewServer } from '../features/html-render';
import { IApiRequestHandler } from '../features/filesystem-routes';
import '../features/html-render/types';

interface IApiHandler {
  default: IApiRequestHandler;
  config?: {
    apiConfig?: {
      bodyParser?:
        | {
            sizeLimit: number | string;
          }
        | boolean;
    };
  };
}

export type IApiRoutes = {
  path: string;
  handler: IApiHandler;
}[];

export type IMiddlewareRoutes = {
  path: string;
  middlewares: IRequestHandlerWithNext[];
}[];

export interface IServerModule {
  middlewares?: IServerMiddleware | IServerMiddleware[];
  getPageData?: ServerPluginConstructor['getPageData'];
  handlePageRequest?: ServerPluginConstructor['handlePageRequest'];
  modifyHtml?: ServerPluginConstructor['modifyHtml'];
}

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
    apiRoutes: IApiRoutes;
    middlewareRoutes: IMiddlewareRoutes;
    application: {
      createApp: CreateServerApp;
    };
    view: IViewServer;
  };
  export const documentPath: string;
  export const clientManifest: IManifest;
  export const serverManifest: IManifest;
}
