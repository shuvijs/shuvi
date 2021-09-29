import { IncomingMessage, ServerResponse } from 'http';
import { IRequest, IMiddlewareHandler, IServerMiddlewareItem } from './server';
import {
  IApi,
  IRouterHistoryMode,
  IAppRouteConfig,
  IApiRouteConfig,
  IUserRouteConfig
} from '../api';

import * as Bundler from '@shuvi/toolpack/lib/webpack/types';

import {
  IApplication,
  IAppRenderFn,
  IRenderOptions
} from '@shuvi/runtime-core';

import {
  IRouteMatch,
  IRouteRecord,
  IRouter,
  IParams,
  IRedirectState,
  IRedirectFn
} from '@shuvi/router';
import { ParsedQuery } from 'query-string';

export * from '@shuvi/runtime-core/lib/runPlugins';

export interface ITemplateData {
  [x: string]: any;
}
export { IUserRouteConfig, IAppRouteConfig, IApiRouteConfig };

export interface IGetRoutes {
  (
    routes: IAppRouteConfig[] | undefined,
    context: IApplicationCreaterContext
  ): IAppRouteConfig[];
}

export type IData = {
  [k: string]: string | number | boolean | undefined | null;
};

export type IQuery = ParsedQuery;

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

export interface IServerAppContext {
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
  routeProps?: { [x: string]: any };
} & {
  [K in keyof Data]: Data[K];
};

export interface IClientRendererOptions<CompType = any, Data = {}>
  extends IRenderOptions<CompType> {
  router: IRouter;
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
  router: IRouter;
  manifest: Bundler.IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IView<
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

export interface IApplicationCreaterContext {
  routeProps?: { [x: string]: any };
  [x: string]: any;
}
export interface IApplicationCreaterServerContext
  extends IApplicationCreaterContext {
  req: IRequest;
}

export interface IApplicationCreaterClientContext
  extends IApplicationCreaterContext {
  pageData: any;
  routeProps: { [x: string]: any };
  historyMode: IRouterHistoryMode;
}

export interface ApplicationCreater {
  (
    context: IApplicationCreaterContext,
    options: {
      render: IAppRenderFn;
    }
  ): IApplication;
}

export interface IApplicationModule {
  create: ApplicationCreater;
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
  serverMiddleware: (IServerMiddlewareItem | IMiddlewareHandler)[];
  onViewDone?(
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ): void;
}

export interface IRuntime<CompType = unknown> {
  install(api: IApi): void;
}
