import type { IncomingMessage } from 'http';
import { IRedirectState, IRouter } from './routerTypes';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { CustomAppContext } from '@shuvi/runtime';
import { IAppData } from './helper';
import { PluginManager } from './lifecycle';
import { IModelManager } from './store';
import {
  IAppGetInitoalPropsContext,
  IRouteLoaderContext
} from './context/routeLoaderContext';

export type IRequest = IncomingMessage & {
  [x: string]: any;
};

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
  router?: IRouter;
  AppComponent: IAppComponent<any>;
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

export interface IClientAppContext extends IAppContext {}

export interface IServerAppContext extends IAppContext {
  req: IRequest;
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
  extends IRenderOptions<IClientAppContext, CompType> {
  router: IRouter;
  appContainer: HTMLElement;
  appData: IAppData<ExtraAppData>;
}

export interface IServerRendererOptions<CompType = any>
  extends IRenderOptions<IServerAppContext, CompType> {
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
  context: AppContext;
  router: IRouter;
  modelManager: IModelManager;
  AppComponent: any;
  UserAppComponent?: any;
  render: IAppRenderFn<AppContext>;
  // server only
  req?: IRequest;
}

export interface ApplicationCreater<
  Context extends IAppContext,
  CompType = any
> {
  (options: {
    // view: IView
    render: IAppRenderFn<Context, CompType>;

    // server only
    req?: IRequest;
  }): IApplication;
}

export type IRuntimeConfig = Record<string, string>;
