import type { IncomingMessage } from 'http';
import { IRouter } from './routerTypes';
import { CustomAppContext } from '@shuvi/runtime';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';
import { IPluginList } from './lifecycle';
import { IModelManager } from './store';
import { IAppData } from './helper';
import { Application } from './application';
import { Response } from './response';

export type IRequest = IncomingMessage & {
  [x: string]: any;
};

export interface IAppContext extends CustomAppContext {
  [x: string]: unknown;
}

export type IRerenderConfig = {
  AppComponent?: any;
  UserAppComponent?: any;
};

export interface IApplication {
  readonly context: IAppContext;
  readonly router: IRouter;
  readonly appComponent: any;
  readonly modelManager: IModelManager;
}

export interface IApplicationOptions {
  router: IRouter;
  modelManager: IModelManager;
  AppComponent: any;
  UserAppComponent?: any;
  plugins?: IPluginList;
}

export type IHtmlAttrs = { textContent?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface IHtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs: IHtmlAttrs;
  innerHTML?: string;
}

export type IRuntimeConfig = Record<string, string>;

export type IRenderDocumentOptions = {
  app: IApplication;
  req: IRequest;
};

export interface IRenderOptions extends IRenderDocumentOptions {}

export interface IClientRendererOptions<ExtraAppData = {}>
  extends IRenderOptions {
  appContainer: HTMLElement;
  appData: IAppData<ExtraAppData>;
}

export interface IServerRendererOptions extends IRenderOptions {
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export type IRenderAppResult<ExtraAppData = {}> = {
  htmlAttrs?: IHtmlAttrs;
  headBeginTags?: IHtmlTag[];
  headEndTags?: IHtmlTag[];
  mainBeginTags?: IHtmlTag[];
  mainEndTags?: IHtmlTag[];
  scriptBeginTags?: IHtmlTag[];
  scriptEndTags?: IHtmlTag[];
  appData?: ExtraAppData;
  redirect?: Response;
  appHtml?: string;
};

export interface IView<
  RenderOption extends IRenderOptions = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
}

export interface IViewClient<ExtraAppData = {}>
  extends IView<IClientRendererOptions<ExtraAppData>> {}

export interface IViewServer<ExtraAppData = {}>
  extends IView<
    IServerRendererOptions,
    Promise<IRenderAppResult<ExtraAppData>>
  > {}

export interface CreateServerApp {
  (options: { req: IRequest; ssr: boolean }): Application;
}
