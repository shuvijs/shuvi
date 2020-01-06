import { Paths } from "./types";
import { Resource } from "./resource";
import { Bootstrap } from "./bootstrap";
export interface ApplicationConfig {
    cwd: string;
    outputPath: string;
    publicPath: string;
}
export interface ApplicationOptions {
    config: ApplicationConfig;
}
declare class ApplicationClass {
    config: ApplicationConfig;
    paths: Paths;
    private _bootstrap;
    constructor({ config }: ApplicationOptions);
    getPublicPath(buildPath: string): string;
    getBootstrapModule(): Bootstrap;
    build(): Promise<void>;
    buildResource(moduleName: string, res: Resource): Promise<void>;
}
export declare type Application = ApplicationClass;
export declare function app(options: ApplicationOptions): ApplicationClass;
export {};
