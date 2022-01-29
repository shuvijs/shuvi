import { createAsyncParallelHook, createAsyncSeriesWaterfallHook, createSyncHook, createSyncBailHook } from '@shuvi/hook'
import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { IRequest } from '@shuvi/service/lib/server/http-server';
import { IServerMiddleware, IServerPluginConstructor } from '@shuvi/service'

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

const pageData = createAsyncParallelHook<void, any, Record<string, unknown>>();
const renderToHTML = createAsyncSeriesWaterfallHook<IRenderToHTML>();
const modifyHtml = createAsyncSeriesWaterfallHook<IDocumentProps, any>();
const onViewDone = createSyncHook<OnViewDoneParams, void, void>();
const render = createSyncBailHook<() => string, IServerAppContext, string>();

export const extendedHooks = {
  pageData,
  renderToHTML,
  modifyHtml,
  onViewDone,
  render
}

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    pageData: typeof pageData
    renderToHTML: typeof renderToHTML
    modifyHtml: typeof modifyHtml
    onViewDone: typeof onViewDone
    render: typeof render
  }
}

export interface IServerModule {
  serverMiddleware?: IServerMiddleware | IServerMiddleware[];
  getPageData?: IServerPluginConstructor['pageData'];
  renderToHTML?: IServerPluginConstructor['renderToHTML'];
  modifyHtml?: IServerPluginConstructor['modifyHtml'];
  onViewDone?: IServerPluginConstructor['onViewDone'];
  render?: (
    renderAppToString: () => string,
    appContext: IServerAppContext
  ) => string | void | undefined;
}
