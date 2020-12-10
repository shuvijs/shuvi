import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import Koa, { DefaultState, DefaultContext } from 'koa';
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
  IRouter
} from '@shuvi/router';
import { ParsedQuery } from 'query-string';
import { IApi, IServerMiddlewareOption } from '../index';
import { IManifest } from './bundler';

export {
  IUserRouteConfig,
  IAppRouteConfig,
  IApplication,
  IAppPlugin,
  IInitAppPlugins,
  IAppPluginRecord,
  IRouteRecord,
  IPartialRouteRecord,
  IRouter
};

export type IData = {
  [k: string]: string | number | boolean | undefined | null;
};

export type IParams = ParsedQuery;

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
  params?: Record<string, string>;
}
export type IServerApp<S = DefaultState, C = CustomContext> = Koa<S, C>;
export type IServerAppContext = Koa.Context;
export type IServerAppMiddleware<
  S = DefaultState,
  C = CustomContext
> = Koa.Middleware<S, C>;
export type IServerAppHandler<S = DefaultState, C = CustomContext> = (
  context: Koa.ParameterizedContext<S, C>
) => any | Promise<void>;
export type IServerAppNext = Koa.Next;
export type IServerAppResponse = Koa.Response;

export interface IServerModule {
  onViewDone(
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ): void;
  serverMiddleware: IServerMiddleware[];
}

export type IServerMiddleware =
  | IServerAppMiddleware
  | IServerAppHandler
  | string
  | {
      path: string;
      handler: string | IServerAppMiddleware | IServerAppHandler;
    };

export type IServerMiddlewareModule = {
  path: string;
  handler: IServerAppMiddleware | IServerAppHandler;
};

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
