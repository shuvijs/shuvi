import { IncomingMessage } from 'http';
import {
  IParams,
  IRedirectFn,
  IRedirectState,
  IRouter,
  IRouteRecord,
  ParsedQuery
} from '@shuvi/router';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IAppData } from './helper';
import { IContext, IRenderOptions, IView } from './application';
import { IErrorHandler } from './appStore';

export {
  matchRoutes,
  matchPathname,
  IRouteRecord,
  rankRouteBranches,
  parseQuery,
  IParams
} from '@shuvi/router';

export { getAppData, getPageData, IAppData, IData } from './helper';

export {
  Application,
  ApplicationCreater, // ApplicationCreater export for @shuvi/service
  IApplication,
  IAppRenderFn
} from './application';

export {
  getAppStore,
  getErrorHandler,
  IAppState,
  IAppStore,
  IErrorHandler
} from './appStore';

export { IRuntimeModule, createPlugin, PluginInstance } from './lifecycle';

export type IQuery = ParsedQuery;

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

export interface IViewClient<
  CompType = any,
  Data = {},
  Router extends IRouter = IRouter
> extends IView<IClientRendererOptions<CompType, Data, Router>> {}

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

export type IHtmlAttrs = { textContent?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface IHtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs: IHtmlAttrs;
  innerHTML?: string;
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

export interface IServerRendererOptions<
  CompType = any,
  Router extends IRouter = IRouter
> extends IRenderOptions<IApplicationCreaterServerContext, Router, CompType> {
  router: Router;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IViewServer<
  CompType = any,
  Data = {},
  Router extends IRouter = IRouter
> extends IView<
    IServerRendererOptions<CompType, Router>,
    Promise<IRenderAppResult<Data>>
  > {}

export interface IApplicationCreaterBase extends IContext {
  routeProps?: { [x: string]: any };
}

export interface IApplicationCreaterServerContext
  extends IApplicationCreaterBase {
  req: IncomingMessage & {
    [x: string]: any;
  };
}
export interface IApplicationCreaterClientContext
  extends IApplicationCreaterBase {
  pageData: any;
  routeProps: { [x: string]: any };
}

export type IApplicationCreaterContext =
  | IApplicationCreaterClientContext
  | IApplicationCreaterServerContext;

export type IRuntimeConfig = Record<string, string>;