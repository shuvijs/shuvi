import { MultiCompiler, Compiler as WebapckCompiler, Configuration } from "webpack";
declare class CompilerHelper {
    private _compiler;
    private _configs;
    addConfig(config: Configuration): this;
    getCompiler(): MultiCompiler;
    getSubCompiler(name: string): WebapckCompiler | undefined;
}
export declare function createCompilerHelper(): CompilerHelper;
export {};
