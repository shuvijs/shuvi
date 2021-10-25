import { IncomingMessage, ServerResponse } from 'http';
import { IRequest, IMiddlewareHandler, IServerMiddlewareItem } from './server';
import {
  IApi,
  IAppRouteConfig,
  IAppRouteConfigWithPrivateProps,
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
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Store } from '@shuvi/shared/lib/miniRedux';

export {
  IAppPlugin,
  IInitAppPlugins,
  IPlugin,
  IAppPluginRecord
} from '@shuvi/runtime-core/lib/runPlugins';

export interface ITemplateData {
  [x: string]: any;
}
export {
  IUserRouteConfig,
  IAppRouteConfigWithPrivateProps,
  IAppRouteConfig,
  IApiRouteConfig
};

export interface IGetRoutes {
  (
    routes: IAppRouteConfigWithPrivateProps[],
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

export type IErrorHandler = (
  errorCode?: SHUVI_ERROR_CODE | string,
  errorDesc?: string
) => void;

export interface IRouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: IQuery;
  params: IParams;
  redirect: IRedirectFn;
  error: IErrorHandler;
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

export type IAppData<Data = {}, appState = any> = {
  ssr: boolean;
  runtimeConfig?: Record<string, string>;
  pageData?: IData;
  routeProps?: { [x: string]: any };
  appState?: appState;
} & {
  [K in keyof Data]: Data[K];
};

export interface IClientRendererOptions<
  CompType = any,
  Data = {},
  Context = IApplicationCreaterClientContext,
  Router = IRouter,
  appStore = Store
> extends IRenderOptions<Context, Router, appStore> {
  router: Router;
  appContainer: HTMLElement;
  appData: IAppData<Data>;
  appStore: appStore;
}

export interface ITelestore {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: any): void;
  dump(): Record<string, any>;
}

export interface IServerRendererOptions<
  CompType = any,
  Context = IApplicationCreaterServerContext,
  Router = IRouter,
  appStore = Store
> extends IRenderOptions<Context, Router, appStore> {
  router: Router;
  appStore: appStore;
  manifest: Bundler.IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IView<
  RenderOption extends IRenderOptions<
    IApplicationCreaterClientContext | IApplicationCreaterServerContext,
    IRouter<IAppRouteConfig>,
    Store
  > = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
}

export interface IViewClient<CompType = any, Data = {}>
  extends IView<
    IClientRendererOptions<
      CompType,
      Data,
      IApplicationCreaterClientContext,
      IRouter<any>,
      Store
    >
  > {}

export interface IViewServer<CompType = any, Data = {}>
  extends IView<
    IServerRendererOptions<
      CompType,
      IApplicationCreaterServerContext,
      IRouter<any>,
      Store
    >,
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
}

export interface ApplicationCreater<appState = any> {
  (
    context: IApplicationCreaterContext,
    options: {
      render: IAppRenderFn<
        IApplicationCreaterContext,
        IRouter<IAppRouteConfig>,
        Store<appState, any>
      >;
      appState?: appState;
    }
  ): IApplication;
}

export interface IApplicationModule<appState = any> {
  create: ApplicationCreater<appState>;
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
