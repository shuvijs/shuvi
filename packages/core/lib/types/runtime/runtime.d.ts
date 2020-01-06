export declare type HtmlAttrs = {
    innerHtml?: string;
} & {
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
export interface AppDaTa {
}
export interface RenderDocumentOptions {
    appData: AppDaTa;
    documentProps: DocumentProps;
}
export declare type RenderDocument = (Document: any, options: RenderDocumentOptions) => string;
export interface RenderAppOptions {
    appData: AppDaTa;
    documentProps: DocumentProps;
}
export declare type RenderApp = (App: any, options: RenderAppOptions) => string;
export interface BootstrapOptions {
    hydrate?: boolean;
    App: any;
}
export declare type Bootstrap = (options: BootstrapOptions) => void;
