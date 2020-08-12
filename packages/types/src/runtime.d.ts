import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import {
  IRouteConfig,
  IRoute,
  ITemplateData,
  IApplication,
  IAppRenderFn,
  IRenderOptions,
  IAppPlugin,
  IInitAppPlugins,
  IAppPluginRecord,
  IError,
  IRenderErrorOptions
} from '@shuvi/core';
import { IRouteMatch, IRouteObject } from '@shuvi/router';
import { ParsedUrlQuery } from 'querystring';
import { IApi } from '../index';
import { IManifest } from './bundler';

export {
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

export type IMatchedRoute<T = IRouteObject> = IRouteMatch<T>;

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

export type IErrorComponent<C, P = {}> = C & {
  getInitialProps?(
    context: Omit<IRouteComponentContext, 'redirect' | 'query' | 'params'> & {
      error?: IError;
    }
  ): P | Promise<P>;
};

export type IRouteComponent<C, P = {}> = C & {
  getInitialProps?(context: IRouteComponentContext): P | Promise<P>;
};

export type IAppData<Data = {}> = {
  ssr: boolean;
  runtimeConfig?: Record<string, string>;
  pageData?: IData;
  hasError?: boolean;
} & {
  [K in keyof Data]: Data[K];
};

export interface IClientRendererOptions<CompType = any, Data = {}>
  extends IRenderOptions<CompType> {
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export interface IClientErrorRendererOptions<Data = {}>
  extends IRenderErrorOptions {
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

export interface IServerErrorRendererOptions extends IRenderErrorOptions {
  url: string;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

interface IView<
  RenderOption extends IRenderOptions = any,
  RenderErrorOptions extends Pick<IRenderOptions, 'appContext'> & {
    error: IError;
  } = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
  renderError(options: RenderErrorOptions): RenderResult;
}

export interface IViewClient<CompType = any, Data = {}>
  extends IView<
    IClientRendererOptions<CompType, Data>,
    IClientErrorRendererOptions<Data>
  > {}

export interface IViewServer<CompType = any, Data = {}>
  extends IView<
    IServerRendererOptions<CompType>,
    IServerErrorRendererOptions,
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

  getAppModulePath(): string;

  getErrorModulePath(): string;

  getViewModulePath(): string;
}
