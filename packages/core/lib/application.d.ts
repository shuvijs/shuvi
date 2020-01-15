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
    getOutputPath(filename: string): string;
    getPublicPath(buildPath: string): string;
    addSelectorFile(path: string, selectFileList: string[], fallbackFile: string): void;
    build(options: BuildOptions): Promise<void>;
    buildOnce(options: BuildOptions): Promise<void>;
}
export declare type Application = ApplicationClass;
export declare function app(options: ApplicationOptions): ApplicationClass;
export {};
