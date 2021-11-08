import { IncomingMessage, ServerResponse } from 'http';

import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';

import { IRequest, IMiddlewareHandler, IServerMiddlewareItem } from './server';

import { Api, IApiRouteConfig, IUserRouteConfig } from '../api';

export interface IRuntime {
  install(api: Api): void;
}

export { IUserRouteConfig, IApiRouteConfig };

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

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
  render?(
    renderAppToString: () => string,
    appContext: IServerAppContext
  ): string;
  serverMiddleware: (IServerMiddlewareItem | IMiddlewareHandler)[];
  onViewDone?(
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ): void;
}
