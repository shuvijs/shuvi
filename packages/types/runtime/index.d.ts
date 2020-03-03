import { ParsedUrlQuery } from "querystring";
import { App } from "../index";

export interface RouteConfig {
  id: string;
  path?: string | string[];
  exact?: boolean;
  routes?: RouteConfig[];
  component?: any;
  componentFile: string;
  [x: string]: any;
}

export interface MatchedRoute<
  Params extends { [K in keyof Params]?: string } = {}
> {
  route: RouteConfig;
  match: {
    params: Params;
    isExact: boolean;
    path: string;
    url: string;
  };
}

export interface RouteComponentContext {
  isServer: boolean;
  pathname: string;
  query: ParsedUrlQuery;
  params: ParsedUrlQuery;
  req?: { url: string };
  // res?: ServerResponse;
}

export type RouteComponent<T, P = {}> = T & {
  getInitialProps?(context: RouteComponentContext): P | Promise<P>;
};

export type RouteProps = {
  [x: string]: any;
};

export interface AppData {
  routeProps: RouteProps;
  dynamicIds: Array<string | number>;
}


export interface AppProps {
  routeProps: RouteProps;
}

export interface RenderAppOptions {
  pathname: string;
  routeProps: RouteProps;
  context: {
    loadableModules: string[];
    // [x: string]: any;
  };
}

export interface RenderAppResult {
  appHtml: string;
}

export interface BootstrapOptions {
  hydrate?: boolean;
  appContainer: HTMLElement;
  appData: AppData;
}

export type Bootstrap = (options: BootstrapOptions) => void;

export interface Runtime<CompType = unknown> {
  install(app: App): void;

  prepareRenderApp(): Promise<void>;

  renderApp(App: CompType, options: RenderAppOptions): Promise<RenderAppResult>;

  generateRoutesSource(routes: RouteConfig[]): string;

  matchRoutes(routes: RouteConfig[], pathname: string): MatchedRoute[];

  getAppFilePath(): string;

  getDocumentFilePath(): string;

  getBootstrapFilePath(): string;
}
