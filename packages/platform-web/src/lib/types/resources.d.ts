import { IRequestHandlerWithNext } from '@shuvi/service';
import { ApplicationCreater } from '@shuvi/platform-shared/lib/runtime';
import {
  IApplicationCreaterServerContext,
  IViewServer
} from '@shuvi/platform-shared/lib/runtime';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IDocumentProps, ITemplateData } from '../features/html-render';
import { IApiRequestHandler } from '../features/api-middleware';

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

interface IServerAppContext {
  req: IRequest;
  [x: string]: any;
}

export declare type IApiRoutes = {
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
    context: IServerAppContext
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(
    context: IServerAppContext
  ): Promise<ITemplateData> | ITemplateData;
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
      createApp: ApplicationCreater<IApplicationCreaterServerContext>;
    };
    document: Partial<IDocumentModule>;
    view: IViewServer;
  };
  export const documentPath: string;
  export const clientManifest: IManifest;
  export const serverManifest: IManifest;
}
