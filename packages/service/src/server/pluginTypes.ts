import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { IServerMiddlewareItem, IRequest } from './http-server';

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

export interface IServerAppContext {
  req: IRequest;
  [x: string]: any;
}

export type OnViewDoneParams = {
  req: IncomingMessage;
  res: ServerResponse;
  html: string | null;
  appContext: any;
};

export type IServerMiddleware =
  | IServerMiddlewareItem
  | IServerMiddlewareItem['handler'];
