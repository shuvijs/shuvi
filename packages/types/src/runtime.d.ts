import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import Koa, { DefaultState, DefaultContext } from 'koa';
import connect from 'connect';
import { UrlWithParsedQuery } from 'url';
import {
  IUserRouteConfig,
  IAppRouteConfig,
  ITemplateData,
  IApplication,
  IAppRenderFn,
  IRenderOptions,
  IAppPlugin,
  IInitAppPlugins,
  IAppPluginRecord
} from '@shuvi/core';
import {
  IRouteMatch,
  IRouteRecord,
  IPartialRouteRecord,
  IRouter,
  IParams
} from '@shuvi/router';
import { ParsedQuery } from 'query-string';
import { IApi, Runtime } from '../index';
import { IManifest } from './bundler';
import http from 'http';

export {
  IUserRouteConfig,
  IAppRouteConfig,
  IApplication,
  IAppPlugin,
  IInitAppPlugins,
  IAppPluginRecord,
  IRouteRecord,
  IPartialRouteRecord,
  IRouter,
  IParams
};

export type IData = {
  [k: string]: string | number | boolean | undefined | null;
};

export type IQuery = ParsedQuery;

export interface IRequest {
  url: string;
  headers: IncomingHttpHeaders;
}

export type IMatchedRoute<T = IRouteRecord> = IRouteMatch<T>;

export type IHtmlAttrs = { textContent?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface IHtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs: IHtmlAttrs;
  innerHTML?: string;
}

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export interface IRedirectFn {
  (status: number, path: string): void;
  (path: string): void;
}
export interface IIncomingMessage extends IncomingMessage {
  url: string;
  parsedUrl: UrlWithParsedQuery;
  originalUrl?: IncomingMessage['url'];
  [x: string]: any;
}

export interface ISeverAppContext {
  req: IRequest;
  [x: string]: any;
}

export interface IRouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: IQuery;
  params: IParams;
  redirect: IRedirectFn;
  appContext: {
    // client only
    pageData?: IData;

    // server only
    req?: IRequest;

    // others
    [x: string]: any;
  };
}

export interface IAppComponentContext extends IRouteComponentContext {
  fetchInitialProps(): Promise<void>;
}

export type IAppComponent<C, P = {}> = C & {
  getInitialProps?(context: IAppComponentContext): P | Promise<P>;
};

export type IRouteComponent<C, P = {}> = C & {
  getInitialProps?(context: IRouteComponentContext): P | Promise<P>;
};

export type IAppData<Data = {}> = {
  ssr: boolean;
  runtimeConfig?: Record<string, string>;
  pageData?: IData;
} & {
  [K in keyof Data]: Data[K];
};

export interface IClientRendererOptions<CompType = any, Data = {}>
  extends IRenderOptions<CompType> {
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export interface ITelestore {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: any): void;
  dump(): Record<string, any>;
}

export interface IServerRendererOptions<CompType = any>
  extends IRenderOptions<CompType> {
  url: string;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

interface IView<
  RenderOption extends IRenderOptions = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
}

export interface IViewClient<CompType = any, Data = {}>
  extends IView<IClientRendererOptions<CompType, Data>> {}

export interface IViewServer<CompType = any, Data = {}>
  extends IView<
    IServerRendererOptions<CompType>,
    Promise<IRenderAppResult<Data>>
  > {}

export interface IRedirectState {
  status?: number;
  path: string;
}

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export type IRenderAppResult<Data = {}> = {
  htmlAttrs?: IHtmlAttrs;
  headBeginTags?: IHtmlTag[];
  headEndTags?: IHtmlTag[];
  mainBeginTags?: IHtmlTag[];
  mainEndTags?: IHtmlTag[];
  scriptBeginTags?: IHtmlTag[];
  scriptEndTags?: IHtmlTag[];
  appData?: Data;
  appHtml?: string;
  redirect?: IRedirectState;
};

export interface IApplicationModule {
  create(
    context: any,
    options: {
      render: IAppRenderFn;
    }
  ): IApplication;
}

export interface IDocumentModule {
  onDocumentProps(
    documentProps: IDocumentProps,
    context: ISeverAppContext
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(
    context: ISeverAppContext
  ): Promise<ITemplateData> | ITemplateData;
}

export interface CustomContext extends DefaultContext {
  params?: IParams;
}

export interface IServerApp extends Omit<connect.Server, 'use'> {
  (req: http.IncomingMessage, res: http.ServerResponse, next?: Function): void;
  use(fn: Runtime.IServerMiddlewareHandler): this;
  use(route: string, fn: Runtime.IServerMiddleware): this;
  // handle(req: Runtime.IServerAppRequest, res: Runtime.IServerAppResponse, next: Runtime.IServerAppNext): void;
}
// export type IServerApp = connect.Server;
// export type IServerAppContext = Koa.Context;
export type IServerAppRequest = IIncomingMessage;
export type IServerAppResponse = ServerResponse;
export type IServerAppNext = connect.NextFunction;

export type NextHandleFunction = (
  req: IServerAppRequest,
  res: IServerAppResponse,
  next: IServerAppNext
) => void;
export type ErrorHandleFunction = (
  err: any,
  req: IServerAppRequest,
  res: IServerAppResponse,
  next: IServerAppNext
) => void;
export type IServerMiddlewareHandler = NextHandleFunction | ErrorHandleFunction;

export interface IServerModule {
  render?(
    renderAppToString: () => string,
    appContext: ISeverAppContext
  ): string;
  onViewDone?(
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ): void;
  serverMiddleware?: IServerMiddleware[];
}

export interface IServerMiddlewareOptions {
  handler: string | IServerMiddlewareHandler;
  path?: string;
  order?: number;
}

export type IServerMiddleware =
  | string
  | IServerMiddlewareHandler
  | IServerMiddlewareOptions;

export interface IServerMiddlewareItem {
  path: string;
  handler: IServerMiddlewareHandler;
}

export interface IRuntime<CompType = unknown> {
  install(api: IApi): void;

  componentTemplate(
    componentModule: string,
    route: IUserRouteConfig & { id: string }
  ): string;

  getAppModulePath(): string;

  get404ModulePath(): string;

  getViewModulePath(): string;
}
