import type { IncomingMessage } from 'http';
import { IRouter, IRoute, IPageRouteRecord } from './routerTypes';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { CustomAppContext } from '@shuvi/runtime';
import { IAppData } from './helper';
import { PluginManager } from './lifecycle';
import { Response } from './response';
import { IModelManager } from './store';
import { LoaderFn, ILoaderOptions, IRouteLoaderContext } from './loader';

export type IRequest = IncomingMessage & {
  [x: string]: any;
};

export interface IAppContext extends CustomAppContext {
  [x: string]: unknown;
}

/**
 * app component getInitialProps params `context`
 */
export interface IAppGetInitoalPropsContext extends IRouteLoaderContext {
  fetchInitialProps(): Promise<void>;
}

export type IAppComponent<C> = C;

export type IRouteComponent<C> = C;

export type IRerenderConfig = {
  AppComponent?: any;
  UserAppComponent?: any;
};

export interface IApplication {
  router: IRouter;
  AppComponent: IAppComponent<any>;
  pluginManager: PluginManager;
  setLoaders(loader: Record<string, LoaderFn>): void;
  runLoaders(
    to: IRoute<IPageRouteRecord>,
    from: IRoute<IPageRouteRecord>
  ): Promise<Response | undefined>;
  run(): Promise<void>;
  rerender(config?: IRerenderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface IRenderOptions<Context, CompType = any> {
  AppComponent: CompType;
  router: IRouter;
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

export type IRenderAppServerResult<ExtraData = {}> = {
  htmlAttrs?: IHtmlAttrs;
  headBeginTags?: IHtmlTag[];
  headEndTags?: IHtmlTag[];
  mainBeginTags?: IHtmlTag[];
  mainEndTags?: IHtmlTag[];
  scriptBeginTags?: IHtmlTag[];
  scriptEndTags?: IHtmlTag[];
  appData?: ExtraData;
  appHtml?: string;
};

export interface IClientRendererOptions<CompType = any, ExtraAppData = {}>
  extends IRenderOptions<IClientAppContext, CompType> {
  appContainer: HTMLElement;
  appData: IAppData<ExtraAppData>;
}

export interface IServerRendererOptions<CompType = any>
  extends IRenderOptions<IServerAppContext, CompType> {
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
    Promise<IRenderAppServerResult<ExtraAppData>>
  > {}

export interface IAppRenderFn<Context, CompType = any> {
  (options: IRenderOptions<Context, CompType>): Promise<any>;
}

export interface IApplicationOptions<AppContext extends IAppContext> {
  router: IRouter;
  modelManager: IModelManager;
  AppComponent: any;
  UserAppComponent?: any;
  render: IAppRenderFn<AppContext>;
  loaders: Record<string, LoaderFn>;
  loaderOptions: ILoaderOptions;

  // client only

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
