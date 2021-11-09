import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { defineHook } from '@shuvi/hook';
import { IRequest, IServerMiddlewareItem } from '@shuvi/service';

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
  render?(
    renderAppToString: () => string,
    appContext: IServerAppContext
  ): string;
  serverMiddleware: (
    | IServerMiddlewareItem
    | IServerMiddlewareItem['handler']
  )[];
  onViewDone?(
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ): void;
}
