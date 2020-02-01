import { AppCore, RouteMatch, RouteConfig } from "./core";

export interface AppData {
  dynamicIds: Array<string | number>;
}

export type HtmlAttrs = { innerHtml?: string } & {
  [x: string]: string;
};

export interface HtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs?: HtmlAttrs;
}

export interface DocumentProps {
  headTags: HtmlTag<"meta" | "link" | "script" | "style">[];
  contentTags: HtmlTag[];
  scriptTags: HtmlTag<"script">[];
}

export interface RenderDocumentOptions {
  documentProps: DocumentProps;
}

export interface AppProps {}

export interface RenderAppOptions {
  url: string;
  context: {
    [x: string]: any;
  };
}

export interface BootstrapOptions {
  hydrate?: boolean;
  appContainer: HTMLElement;
  appData: AppData,
}

export type Bootstrap = (options: BootstrapOptions) => void;

export interface Runtime<CompType = unknown> {
  install(app: AppCore): void;

  renderDocument(
    Document: CompType,
    options: RenderDocumentOptions
  ): Promise<string>;

  renderApp(App: CompType, options: RenderAppOptions): Promise<string>;

  matchRoutes(routes: RouteConfig[], pathname: string): RouteMatch[];

  // renderComponent(App: T, options: RenderAppOptions): string;

  getDocumentFilePath(): string;

  getBootstrapFilePath(): string;
}
