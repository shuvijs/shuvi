import { IncomingMessage } from 'http';
import {
  ParsedQuery,
  IRedirectState,
  IRouter,
  IRouteRecord
} from '@shuvi/router';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { CustomAppContext } from '@shuvi/runtime';
import { IAppData } from './helper';
import { PluginManager } from './lifecycle';
import { IModelManager } from './appStore';
import {
  IAppGetInitoalPropsContext,
  IRouteLoaderContext
} from './context/routeLoaderContext';

export { IRouter };

export type IURLQuery = ParsedQuery;

export interface IAppContext extends CustomAppContext {
  [x: string]: unknown;
}

export type IAppComponent<C, P = {}> = C & {
  getInitialProps?(context: IAppGetInitoalPropsContext): P | Promise<P>;
};

export type IRouteComponent<C, P = {}> = C & {
  getInitialProps?(context: IRouteLoaderContext): P | Promise<P>;
};

export type IRerenderConfig = {
  AppComponent?: any;
  UserAppComponent?: any;
};

export interface IApplication {
  AppComponent: IAppComponent<any>;
  router?: IRouter;
  pluginManager: PluginManager;
  run(): Promise<{ [k: string]: any }>;
  rerender(config?: IRerenderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface IRenderOptions<Context, CompType = any> {
  AppComponent: CompType;
  router?: IRouter;
  appContext: Context;
  modelManager: IModelManager;
}

export interface IClientUserContext extends IAppContext {}

export interface IServerUserContext extends IAppContext {
  req: IncomingMessage & {
    [x: string]: any;
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

export interface IClientRendererOptions<CompType = any, ExtraAppData = {}>
  extends IRenderOptions<IClientUserContext, CompType> {
  router: IRouter;
  appContainer: HTMLElement;
  appData: IAppData<ExtraAppData>;
}

export interface IServerRendererOptions<CompType = any>
  extends IRenderOptions<IServerUserContext, CompType> {
  router: IRouter;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IView<
  RenderOption extends IRenderOptions<IAppContext> = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
}

export interface IViewClient<CompType = any, ExtraAppData = {}>
  extends IView<IClientRendererOptions<CompType, ExtraAppData>> {}

export interface IViewServer<CompType = any, ExtraAppData = {}>
  extends IView<
    IServerRendererOptions<CompType>,
    Promise<IRenderAppResult<ExtraAppData>>
  > {}

export interface IAppRenderFn<Context, CompType = any> {
  (options: IRenderOptions<Context, CompType>): Promise<any>;
}

export interface IApplicationOptions<AppContext extends IAppContext> {
  router: IRouter;
  context: AppContext;
  modelManager: IModelManager;
  AppComponent: any;
  UserAppComponent?: any;
  render: IAppRenderFn<AppContext>;
}

export interface ApplicationCreater<
  Context extends IAppContext,
  CompType = any
> {
  (options: {
    // view: IView
    render: IAppRenderFn<Context, CompType>;

    // server only
    req?: IncomingMessage & {
      [x: string]: any;
    };
  }): IApplication;
}

export type IRuntimeConfig = Record<string, string>;

export type IRouteData = {
  routeProps?: { [x: string]: any };
};

export interface IAppRouteConfig extends IRouteRecord {
  id: string;
  component?: any;
  children?: IAppRouteConfig[];
  path: string;
  fullPath?: string;
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
  fullPath: string;
  __componentSource__: string;
  __componentSourceWithAffix__: string;
  __import__: () => Promise<any>;
  __resolveWeak__: () => any;
  [x: string]: any;
}
