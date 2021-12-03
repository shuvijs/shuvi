import { IncomingMessage, ServerResponse } from 'http';
import {
  ApplicationCreater,
  IApplicationCreaterServerContext,
  IHtmlAttrs,
  IHtmlTag,
  IViewServer
} from '@shuvi/platform-core';
import { defineHook } from '@shuvi/hook';
import {
  IRequest,
  IServerMiddlewareItem,
  IRequestHandlerWithNext
} from '@shuvi/service';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IApiRequestHandler } from '../apiRoute/apiRouteHandler';
import { IServerPluginConstructor } from '../serverHooks';

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export type IHookModifyHtml = defineHook<
  'modifyHtml',
  {
    initialValue: IDocumentProps;
    args: [object /* appContext */];
  }
>;

export type IRenderToHTML = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<string | null>;

export type IHookRenderToHTML = defineHook<
  'renderToHTML',
  {
    initialValue: (
      req: IncomingMessage,
      res: ServerResponse
    ) => Promise<string | null>;
  }
>;

interface IServerAppContext {
  req: IRequest;
  [x: string]: any;
}

export interface ITemplateData {
  [x: string]: any;
}

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
  render?: (
    renderAppToString: () => string,
    appContext: IServerAppContext
  ) => string;
  serverMiddleware: (
    | IServerMiddlewareItem
    | IServerMiddlewareItem['handler']
  )[];
  onViewDone?: (
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ) => void;
  pageData: IServerPluginConstructor['pageData'];
  renderToHTML: IServerPluginConstructor['renderToHTML'];
  modifyHtml: IServerPluginConstructor['modifyHtml'];
}

interface IApiModule {
  default: IApiRequestHandler;
  config?: {
    apiConfig?: {
      bodyParser?: { sizeLimit: number | string } | boolean;
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

export type IBuiltResource = {
  server: {
    server: any;
    apiRoutes: IApiRoutes;
    middlewareRoutes: IMiddlewareRoutes;
    application: {
      create: ApplicationCreater<IApplicationCreaterServerContext>;
    };
    document: any;
    view: IViewServer;
  };
  documentTemplate: any;
  clientManifest: IManifest;
  serverManifest: IManifest;
};
