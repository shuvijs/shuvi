import {
  IRequestHandlerWithNext,
  IServerMiddleware,
  IServerPluginConstructor
} from '@shuvi/service';
import {
  IAppContext,
  CreateServerApp
} from '@shuvi/platform-shared/lib/runtime';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import {
  IDocumentProps,
  ITemplateData,
  IViewServer
} from '../features/html-render';
import { IApiRequestHandler } from '../features/api-middleware';
import '../features/html-render/types';

interface IApiModule {
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
  apiModule: IApiModule;
}[];

export type IMiddlewareRoutes = {
  path: string;
  middlewares: IRequestHandlerWithNext[];
}[];

export interface IDocumentModule {
  onDocumentProps(
    documentProps: IDocumentProps,
    context: IAppContext
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(context: IAppContext): Promise<ITemplateData> | ITemplateData;
}

export interface IServerModule {
  middlewares?: IServerMiddleware | IServerMiddleware[];
  getPageData?: IServerPluginConstructor['pageData'];
  renderToHTML?: IServerPluginConstructor['renderToHTML'];
  modifyHtml?: IServerPluginConstructor['modifyHtml'];
}

declare module '@shuvi/service/lib/resources' {
  export const server: {
    server: IServerModule;
    apiRoutes: IApiRoutes;
    middlewareRoutes: IMiddlewareRoutes;
    application: {
      createApp: CreateServerApp;
    };
    document: Partial<IDocumentModule>;
    view: IViewServer;
  };
  export const documentPath: string;
  export const clientManifest: IManifest;
  export const serverManifest: IManifest;
}
