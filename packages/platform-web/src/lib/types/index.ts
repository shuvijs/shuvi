import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/runtime-core';

import { IRequest, IRequestHandlerWithNext } from '@shuvi/service';
import { IApiRequestHandler } from '../apiRoute/apiRouteHandler';
export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export type IRenderToHTML = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<string | null>;

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
