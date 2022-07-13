import {
  IRequestHandlerWithNext,
  IServerMiddleware,
  ServerPluginConstructor
} from '@shuvi/service';
import { CreateAppServer } from '../../shared';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IViewServer } from '../features/html-render';
import { IApiRequestHandler } from '../features/filesystem-routes';
import '../features/main/shuvi-app';
import '../features/html-render/shuvi-app';

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
      createApp: CreateAppServer;
    };
    view: IViewServer;
  };
  export const documentPath: string;
  export const clientManifest: IManifest;
  export const serverManifest: IManifest;
}
