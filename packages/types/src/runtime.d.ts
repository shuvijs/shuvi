import { UrlWithParsedQuery } from "url";
import { IRouteConfig, IRoute, ITemplateData } from "@shuvi/core";
import { ParsedUrlQuery } from "querystring";
import { IApi } from "../index";
import { IManifest } from "./bundler";

export interface IRequest {
  url: UrlWithParsedQuery;
}

export { IRouteConfig, IRoute };

export interface IMatchedRoute<
  Params extends { [K in keyof Params]?: string } = {}
> {
  route: IRouteConfig;
  match: {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
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

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    "meta" | "link" | "style" | "script" | "noscript" | "title"
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<"script">[];
}

export interface IAppComponentContext {
  req: IRequest;
}

export interface IRouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: ParsedUrlQuery;
  params: ParsedUrlQuery;
  req?: IRequest;
  // res?: ServerResponse;
}

export type IAppComponent<C, P = {}> = C & {
  getInitialProps?(context: IAppComponentContext): P | Promise<P>;
};

export type IRouteComponent<C, P = {}> = C & {
  getInitialProps?(context: IRouteComponentContext): P | Promise<P>;
};

export type IAppData<Data = {}> = { runtimeConfig: { [k: string]: string } } & {
  [K in keyof Data]: Data[K];
};

export interface IBootstrapOptions<Data = {}> {
  AppComponent: any;
  appContainer: HTMLElement;
  appData: IAppData<Data>;
}

export type IBootstrap<Data = {}> = (options: IBootstrapOptions<Data>) => void;

export interface IRenderAppOptions<CompType = any> {
  api: IApi;
  req: IRequest;
  App: CompType;
  routes: IRoute[];
  manifest: IManifest;
}

export type IRenderer<CompType = any, Data = {}> = (
  options: IRenderAppOptions<CompType>
) => Promise<IRenderAppResult<Data>>;

export type IRenderAppResult<Data = {}> = {
  htmlAttrs?: IHtmlAttrs;
  headBeginTags?: IHtmlTag[];
  headEndTags?: IHtmlTag[];
  mainBeginTags?: IHtmlTag[];
  mainEndTags?: IHtmlTag[];
  scriptBeginTags?: IHtmlTag[];
  scriptEndTags?: IHtmlTag[];
  appHtml: string;
  appData: Data;
};

export type IRouterAction = "PUSH" | "POP" | "REPLACE";

export interface IRouterListener {
  (location: IRouterLocation, action: IRouterAction): void;
}

export interface IRouterLocation {
  pathname: string;
  search: string;
  state: any;
  hash: string;
}

export interface IRouter {
  push(path: string, state?: any): void;
  replace(path: string, state?: any): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
  onChange(listener: IRouterListener): () => void;
}

export interface IAppModule {
  App: any;
}

export interface IDocumentModule {
  onDocumentProps(
    documentProps: IDocumentProps
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(): Promise<ITemplateData> | ITemplateData;
}

export interface IRuntime<CompType = unknown> {
  install(api: IApi): void;

  matchRoutes(routes: IRouteConfig[], pathname: string): IMatchedRoute[];

  getRouterModulePath(): string;

  getAppModulePath(): string;

  getBootstrapModulePath(): string;

  get404ModulePath(): string;

  getRendererModulePath(): string;
}
