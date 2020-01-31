import { IncomingMessage, ServerResponse } from "http";
import { Application } from "../../application";
import { RouteMatch, RouteConfig } from "../services/routerService";
// #document

export type HtmlAttrs = { innerHtml?: string } & {
  [x: string]: string;
};

export interface HtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs?: HtmlAttrs;
}

export interface DocumentProps {
  appHtml: string;
  headTags: HtmlTag<"meta" | "link" | "script" | "style">[];
  bodyTags: HtmlTag<"script">[];
}

// #renderer

export interface AppDaTa {}

export interface RenderDocumentOptions {
  appData: AppDaTa;
  documentProps: DocumentProps;
}

export interface RenderAppOptions {
  appData: AppDaTa;
  documentProps: DocumentProps;
}

export interface BootstrapOptions<T = unknown> {
  hydrate?: boolean;
  App: T;
}

export type Bootstrap<T = unknown> = (options: BootstrapOptions<T>) => void;

export interface Runtime<CompType = unknown> {
  install(app: Application): void;

  renderDocument(
    req: IncomingMessage,
    res: ServerResponse,
    Document: CompType,
    App: CompType | null,
    options: RenderDocumentOptions
  ): Promise<string>;

  matchRoutes(routes: RouteConfig[], pathname: string): RouteMatch[];

  // renderComponent(App: T, options: RenderAppOptions): string;

  getDocumentFilePath(): string;

  getBootstrapFilePath(): string;
}
