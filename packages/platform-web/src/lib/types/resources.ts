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
  /**
   *  we already have onDocumentProps in document.js,
   *  for simplicity, we don't need to add it here.
   */
  // modifyHtml?: IServerPluginConstructor['modifyHtml'];
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
