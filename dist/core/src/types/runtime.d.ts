import { AppCore, RouteMatch, RouteConfig } from "./core";
export declare type RouteProps = {
    [x: string]: any;
};
export interface AppData {
    routeProps: RouteProps;
    dynamicIds: Array<string | number>;
}
export declare type HtmlAttrs = {
    innerHtml?: string;
} & {
    [x: string]: string | number | undefined;
};
export interface HtmlTag<TagNames = string> {
    tagName: TagNames;
    attrs?: HtmlAttrs;
}
export interface DocumentProps {
    headTags: HtmlTag<"meta" | "link" | "style" | "script" | "noscript" | "title">[];
    contentTags: HtmlTag[];
    scriptTags: HtmlTag<"script">[];
}
export interface RenderDocumentOptions {
    documentProps: DocumentProps;
}
export interface AppProps {
    routeProps: RouteProps;
}
export interface RenderAppOptions {
    pathname: string;
    routeProps: RouteProps;
    context: {
        loadableModules: string[];
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
export declare type Bootstrap = (options: BootstrapOptions) => void;
export interface Runtime<CompType = unknown> {
    install(app: AppCore): void;
    renderDocument(Document: CompType, options: RenderDocumentOptions): Promise<string>;
    prepareRenderApp(): Promise<void>;
    renderApp(App: CompType, options: RenderAppOptions): Promise<RenderAppResult>;
    generateRoutesSource(routes: RouteConfig[]): string;
    matchRoutes(routes: RouteConfig[], pathname: string): RouteMatch[];
    getAppFilePath(): string;
    getDocumentFilePath(): string;
    getBootstrapFilePath(): string;
}
