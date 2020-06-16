import { UrlWithParsedQuery } from 'url';
import { IncomingHttpHeaders } from 'http';
import { IRouteBase, IRouteConfig, IRoute, ITemplateData } from '@shuvi/core';
import { ParsedUrlQuery } from 'querystring';
import { IApi } from '../index';
import { IManifest } from './bundler';
import { Hookable } from '@shuvi/hooks';

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
  appContext: {
    // server only
    req?: IRequest;
    [x: string]: any
  };

  // special props
  fetchInitialProps(): Promise<void>;
}

export interface IRouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: IQuery;
  params: IParams;
  redirect: IRedirectFn;
  appContext: {
    // server only
    req?: IRequest;
    [x: string]: any
  };
}

export type IAppComponent<C, P = {}> = C & {
  getInitialProps?(context: IAppComponentContext): P | Promise<P>;
};

export type IRouteComponent<C, P = {}> = C & {
  getInitialProps?(context: IRouteComponentContext): P | Promise<P>;
};

export type IAppData<Data = {}> = {
  runtimeConfig?: { [k: string]: string };
  ssr: boolean;
} & {
  [K in keyof Data]: Data[K];
};

export interface IRendererOptions<CompType = any> {
  AppComponent: CompType;
  routes: IRoute[];
  appContext: Record<string, any>;
}

export interface IClientRendererOptions<CompType = any, Data = {}>
  extends IRendererOptions<CompType> {
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export type IClientRenderer<CompType = any, Data = {}> = (
  options: IClientRendererOptions<CompType, Data>
) => void;

export interface ITelestore {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: any): void;
  dump(): Record<string, any>;
}

export interface IServerRendererOptions<CompType = any>
  extends IRendererOptions<CompType> {
  req: IRequest;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
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

export interface IAppRenderFn {
  (options: IRendererOptions): Promise<any>;
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
    documentProps: IDocumentProps
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(): Promise<ITemplateData> | ITemplateData;
}

export interface IApplication extends Hookable {
  AppComponent: any;
  routes: IRoute[];

  run(): Promise<void>;
  rerender(): Promise<void>;
  dispose(): Promise<void>;
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

export type Plugin = <O extends {}>(
  tap: IApplication['tap'],
  options?: O
) => void;

export type InitPlugins = (params: {
  applyPluginOption: (name: string, options: unknown) => void;
  registerPlugin: IApplication['tap'];
}) => void;
