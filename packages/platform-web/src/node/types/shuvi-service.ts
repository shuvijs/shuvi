import {
  IRequestHandlerWithNext,
  ServerPluginConstructor
} from '@shuvi/service';
import { CreateAppServer } from '../../shared';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IViewServer } from '../features/html-render';
import { IApiRequestHandler } from '../features/filesystem-routes';
import '../features/filesystem-routes/shuvi-app';
import '../features/html-render/shuvi-app';
import '../features/model/shuvi-app';

export { IApiRequestHandler };

export interface IApiConfig {
  apiConfig?: {
    bodyParser?:
      | {
          sizeLimit: number | string;
        }
      | boolean;
  };
}

export interface IApiHandler {
  default: IApiRequestHandler;
  config?: IApiConfig;
}

export interface IMiddlewareConfig {
  default: IRequestHandlerWithNext;
}

export type IApiRoutes = {
  path: string;
  api: IApiHandler;
}[];

export type IMiddlewareRoutes = {
  path: string;
  middleware: IMiddlewareConfig;
}[];

export interface IServerModule {
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
