import { ParsedQuery } from 'query-string';
import {
  IParams,
  IRedirectFn,
  IRedirectState,
  IRouter,
  IRouteRecord
} from '@shuvi/router';
import {
  IAppData,
  IApplicationCreaterContext,
  IApplicationCreaterClientContext,
  IApplicationCreaterServerContext,
  IRenderOptions,
  IErrorHandler,
  IView
} from '@shuvi/runtime-core';

import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IApi } from '@shuvi/service';

export type IQuery = ParsedQuery;

export interface IRuntime {
  install(api: IApi): void;
}

export {
  IData,
  Application,
  IApplication,
  getAppStore,
  getErrorHandler,
  IAppState,
  IAppStore,
  IErrorHandler,
  IAppRenderFn,
  getAppData,
  getPageData,
  IApplicationCreaterBase,
  IApplicationCreaterClientContext,
  IApplicationCreaterServerContext
} from '@shuvi/runtime-core';

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

interface IClientRendererOptions<
  CompType = any,
  Data = {},
  Router extends IRouter<any> = IRouter<any>
> extends IRenderOptions<IApplicationCreaterClientContext, Router> {
  router: Router;
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export interface IAppRouteConfig extends IRouteRecord {
  id: string;
  component?: any;
  children?: IAppRouteConfig[];
  path: string;
  __componentSource__?: never;
  __componentSourceWithAffix__?: never;
  __import__?: never;
  __resolveWeak__?: never;
  [x: string]: any;
}

export interface IAppRouteConfigWithPrivateProps extends IRouteRecord {
  id: string;
  component?: any;
  children?: IAppRouteConfigWithPrivateProps[];
  path: string;
  __componentSource__: string;
  __componentSourceWithAffix__: string;
  __import__: () => Promise<any>;
  __resolveWeak__: () => any;
  [x: string]: any;
}

export interface IViewClient<CompType = any, Data = {}>
  extends IView<IClientRendererOptions<CompType, Data, IRouter<any>>> {}

export interface IServerRendererOptions<
  CompType = any,
  Router extends IRouter<any> = IRouter<any>
> extends IRenderOptions<IApplicationCreaterServerContext, Router> {
  router: Router;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IRouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: IQuery;
  params: IParams;
  redirect: IRedirectFn;
  error: IErrorHandler;
  appContext: IApplicationCreaterContext;
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

export interface IViewServer<CompType = any, Data = {}>
  extends IView<
    IServerRendererOptions<CompType, IRouter<any>>,
    Promise<IRenderAppResult<Data>>
  > {}

export type IHtmlAttrs = { textContent?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface IHtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs: IHtmlAttrs;
  innerHTML?: string;
}
