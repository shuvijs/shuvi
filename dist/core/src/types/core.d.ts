/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { ParsedUrlQuery } from "querystring";
import { File } from "../models/files";
export interface Paths {
    projectDir: string;
    buildDir: string;
    srcDir: string;
    appDir: string;
    pagesDir: string;
}
export interface RouteConfig {
    id: string;
    path?: string | string[];
    exact?: boolean;
    routes?: RouteConfig[];
    component?: any;
    componentFile: string;
    [x: string]: any;
}
export interface MatchedRoute<Params extends {
    [K in keyof Params]?: string;
}> {
    route: RouteConfig;
    match: {
        params: Params;
        isExact: boolean;
        path: string;
        url: string;
    };
}
export interface RouteMatch {
    route: RouteConfig;
    match: {
        url: string;
        isExact: boolean;
    };
}
export interface AppConfig {
    cwd: string;
    outputPath: string;
    publicUrl: string;
}
export interface BuildOptions {
}
export interface RouteComponentContext {
    isServer: boolean;
    pathname: string;
    query: ParsedUrlQuery;
    req?: IncomingMessage;
    res?: ServerResponse;
}
export declare type RouteComponent<T, P = {}> = T & {
    getInitialProps?(context: RouteComponentContext): P | Promise<P>;
};
export interface AppCore {
    config: AppConfig;
    paths: Paths;
    resolveInternalFile(...paths: string[]): string;
    setBootstrapModule(module: string): void;
    setAppModule(lookups: string[], fallback: string): void;
    setDocumentModule(lookups: string[], fallback: string): void;
    setRoutesSource(content: string): void;
    addFile(file: File): void;
    build(options: BuildOptions): Promise<void>;
    buildOnce(options: BuildOptions): Promise<void>;
}
