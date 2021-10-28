import { IncomingMessage, ServerResponse } from 'http';
import { IRequest, IMiddlewareHandler, IServerMiddlewareItem } from './server';

import { IApiRouteConfig, IUserRouteConfig } from '../api';

import { IRouteMatch, IRouteRecord, IRedirectState } from '@shuvi/router';

import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';

export interface ITemplateData {
  [x: string]: any;
}

export { IUserRouteConfig, IApiRouteConfig };

export type IMatchedRoute<T = IRouteRecord> = IRouteMatch<T>;

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

export interface ITelestore {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: any): void;
  dump(): Record<string, any>;
}

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
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
