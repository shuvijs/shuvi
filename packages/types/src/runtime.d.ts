import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import {
  IRouteBase,
  IRouteConfig,
  IRoute,
  ITemplateData,
  IApplication,
  IAppRenderFn,
  IRenderOptions,
  IAppPlugin,
  IInitAppPlugins,
  IAppPluginRecord
} from '@shuvi/core';
import { ParsedUrlQuery } from 'querystring';
import { IApi } from '../index';
import { IManifest } from './bundler';

export {
  IRouteBase,
  IRouteConfig,
  IRoute,
  IApplication,
  IAppPlugin,
  IInitAppPlugins,
  IAppPluginRecord
};

export type IData = {
  [k: string]: string | number | boolean | undefined | null;
};

export type IParams = ParsedUrlQuery;

export type IQuery = ParsedUrlQuery;

export interface IRequest {
  url: string;
  headers: IncomingHttpHeaders;
}

export interface IMatchedRoute<
  Params extends { [K in keyof Params]?: string } = {}
> {
  route: IRouteBase;
  match: {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
  };
}

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

export type IErrorComponent<C, P = {}> = C & {
  getInitialProps?(
    context: Omit<IRouteComponentContext, 'redirect' | 'query' | 'params'> & {
      error?: Error;
      statusCode?: number;
    }
  ): P | Promise<P>;
};

export type IAppData<Data = {}> = {
  ssr: boolean;
  runtimeConfig?: Record<string, string>;
  pageData?: IData;
  statusCode?: number;
} & {
  [K in keyof Data]: Data[K];
};

export interface IClientRendererOptions<CompType = any, Data = {}>
  extends IRenderOptions<CompType> {
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export interface IClientErrorRendererOptions<CompType = any, Data = {}>
  extends Pick<IRenderOptions<CompType>, 'appContext'> {
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export type IClientRenderer<CompType = any, Data = {}> = {
  renderError: (options: IClientErrorRendererOptions<CompType, Data>) => void;
  renderApp: (options: IClientRendererOptions<CompType, Data>) => void;
};

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

export interface IServerErrorRendererOptions<CompType = any>
  extends Pick<IRenderOptions<CompType>, 'appContext'> {
  url: string;
  error?: Error;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export type IServerRenderer<CompType = any, Data = {}> = {
  renderError: (
    options: IServerErrorRendererOptions<CompType>
  ) => Promise<IRenderAppResult<Data>>;
  renderApp: (
    options: IServerRendererOptions<CompType>
  ) => Promise<IRenderAppResult<Data>>;
};

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
  routeNotFound?: boolean;
};

export type IRouterAction = 'PUSH' | 'POP' | 'REPLACE';

export interface IRouterServerContext {
  url?: string;
}

export interface IRouterListener {
  (location: IRouterLocation, action: IRouterAction): void;
}

export interface IRouterLocation {
  pathname: string;
  search: string;
  state: any;
  hash: string;
}

export interface IRouter {
  query: IQuery;
  location: IRouterLocation;
  push(path: string, state?: any): void;
  replace(path: string, state?: any): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
  onChange(listener: IRouterListener): () => void;
}

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

export interface IServerModule {
  onViewDone(
    req: IncomingMessage,
    res: ServerResponse,
    ctx: {
      html: string | null;
      appContext: any;
    }
  ): void;
}

export interface IRuntime<CompType = unknown> {
  install(api: IApi): void;

  componentTemplate(
    componentModule: string,
    route: IRouteConfig & { id: string }
  ): string;

  matchRoutes(routes: IRouteConfig[], pathname: string): IMatchedRoute[];

  getRouterModulePath(): string;

  getAppModulePath(): string;

  get404ModulePath(): string;

  getErrorModulePath(): string;

  getClientRendererModulePath(): string;

  getServerRendererModulePath(): string;
}
