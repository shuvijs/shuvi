import { Paths } from "./types";
import { TemplateData } from "./types/file";
import { RouterService, RouteConfig } from "./types/services/routerService";
export interface ApplicationConfig {
    cwd: string;
    outputPath: string;
    publicPath: string;
}
export interface ApplicationOptions {
    config: ApplicationConfig;
    routerService: RouterService;
}
export interface BuildOptions {
    bootstrapFile: string;
}
export interface RouterConfig {
    routes: RouteConfig[];
}
declare class ApplicationClass {
    config: ApplicationConfig;
    paths: Paths;
    private _routerService;
    constructor({ config, routerService }: ApplicationOptions);
    getAppPath(filename: string): string;
    getSrcPath(filename: string): string;
    getOutputPath(filename: string): string;
    getPublicPath(buildPath: string): string;
    addSelectorFile(path: string, selectFileList: string[], fallbackFile: string): void;
    addTemplateFile(path: string, templateFile: string, data?: TemplateData): void;
    addFile(path: string, { content }: {
        content: string;
    }): void;
    getRouterConfig(): Promise<RouterConfig>;
    build(options: BuildOptions): Promise<void>;
    buildOnce(options: BuildOptions): Promise<void>;
}
export declare type Application = ApplicationClass;
export declare function app(options: ApplicationOptions): ApplicationClass;
export {};
