import { createAsyncParallelHook, createAsyncSeriesWaterfallHook, createSyncBailHook } from '@shuvi/hook'
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

const pageData = createAsyncParallelHook<void, any, Record<string, unknown>>();
const renderToHTML = createAsyncSeriesWaterfallHook<IRenderToHTML>();
const modifyHtml = createAsyncSeriesWaterfallHook<IDocumentProps, any>();
const render = createSyncBailHook<() => string, IServerAppContext, string>();

export const extendedHooks = {
  pageData,
  renderToHTML,
  modifyHtml,
  render
}

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    pageData: typeof pageData
    renderToHTML: typeof renderToHTML
    modifyHtml: typeof modifyHtml
    render: typeof render
  }
}

export interface IServerModule {
  middlewares?: IServerMiddleware | IServerMiddleware[];
  getPageData?: IServerPluginConstructor['pageData'];
  renderToHTML?: IServerPluginConstructor['renderToHTML'];
  modifyHtml?: IServerPluginConstructor['modifyHtml'];
  render?: (
    renderAppToString: () => string,
    appContext: IServerAppContext
  ) => string | void | undefined;
}
