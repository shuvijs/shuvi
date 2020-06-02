import { UrlWithParsedQuery } from 'url';
import { IncomingHttpHeaders } from 'http';
import { IRouteBase, IRouteConfig, IRoute, ITemplateData } from '@shuvi/core';
import { ParsedUrlQuery } from 'querystring';
import { IApi } from '../index';
import { IManifest } from './bundler';

export type IParams = ParsedUrlQuery;

export type IQuery = ParsedUrlQuery;

export interface IRequest {
  url: string;
  parsedUrl: UrlWithParsedQuery;
  headers: IncomingHttpHeaders;
}

export { IRouteBase, IRouteConfig, IRoute };

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

export interface IAppComponentContext {
  isServer: boolean;
  pathname: string;
  query: IQuery;
  params: IParams;
  redirect: IRedirectFn;

  // special props
  fetchInitialProps(): Promise<void>;

  // server only
  req?: IRequest;
}

export interface IRouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: IQuery;
  params: IParams;
  redirect: IRedirectFn;

  // server only
  req?: IRequest;
}

export type IAppComponent<C, P = {}> = C & {
  getInitialProps?(context: IAppComponentContext): P | Promise<P>;
};

export type IRouteComponent<C, P = {}> = C & {
  getInitialProps?(context: IRouteComponentContext): P | Promise<P>;
};

export type IAppData<Data = {}> = {
  runtimeConfig?: { [k: string]: string };
  telestore: Record<string, any>;
  ssr: boolean;
} & {
  [K in keyof Data]: Data[K];
};

export interface IClientRendererOptions<Data = {}> {
  appData: IAppData<Data>;
  App: any;
  routes: IRoute[];
  appContainer: HTMLElement;
}

export type IClientRenderer<Data = {}> = (
  options: IClientRendererOptions<Data>
) => void;

export interface ITelestore {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: any): void;
  dump(): Record<string, any>;
}

// go throug document lifecycle
export interface IServerContext {
  req: IRequest;
  telestore: ITelestore;
  [x: string]: any;
}

// go throug app lifecycle
export interface IAppContext {
  [x: string]: any;
}

export interface IServerRendererOptions<CompType = any> {
  api: IApi;
  App: CompType;
  routes: IRoute[];
  manifest: IManifest;
  context: IServerContext;
}

export type IServerRenderer<CompType = any, Data = {}> = (
  options: IServerRendererOptions<CompType>
) => Promise<IRenderAppResult<Data>>;

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
  create(context: any): any;
}

export interface IDocumentModule {
  onDocumentProps(
    documentProps: IDocumentProps,
    ctx: IServerContext
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(ctx: IServerContext): Promise<ITemplateData> | ITemplateData;
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

  getClientRendererModulePath(): string;

  getServerRendererModulePath(): string;
}
