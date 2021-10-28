import { ParsedQuery } from 'query-string';
import { IParams, IRedirectFn, IRouter, IRouteRecord } from '@shuvi/router';

import {
  IAppData,
  IApplicationCreaterContext,
  IApplicationCreaterClientContext,
  IRenderOptions,
  IErrorHandler,
  IView
} from '@shuvi/runtime-core';

export {
  IRuntime,
  IViewServer,
  IUserRouteConfig,
  IHtmlAttrs,
  IHtmlTag
} from '@shuvi/service/lib/types/index';

export type IQuery = ParsedQuery;

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

interface IClientRendererOptions<
  CompType = any,
  Data = {},
  Router extends IRouter<any> = IRouter<any>
> extends IRenderOptions<IApplicationCreaterClientContext, Router, CompType> {
  router: Router;
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export interface IViewClient<CompType = any, Data = {}, Router extends IRouter = IRouter>
  extends IView<IClientRendererOptions<CompType, Data, Router>> {}

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
