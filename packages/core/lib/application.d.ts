import { Paths } from "./types";
export interface ApplicationConfig {
    cwd: string;
    outputPath: string;
    publicPath: string;
}
export interface ApplicationOptions {
    config: ApplicationConfig;
}
export interface BuildOptions {
    bootstrapSrc: string;
}
declare class ApplicationClass {
    config: ApplicationConfig;
    paths: Paths;
    constructor({ config }: ApplicationOptions);
    getAppPath(filename: string): string;
    getSrcPath(filename: string): string;
    getPublicPath(buildPath: string): string;
    addGatewayFile(path: string, files: string[]): void;
    build(options: BuildOptions): Promise<void>;
}
export declare type Application = ApplicationClass;
export declare function app(options: ApplicationOptions): ApplicationClass;
export {};
