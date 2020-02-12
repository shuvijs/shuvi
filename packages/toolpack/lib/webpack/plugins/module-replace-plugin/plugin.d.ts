import { Compiler, Plugin } from "webpack";
export declare type ConfigItem = {
    test: Function | RegExp;
    module: string;
};
export interface ModuleReplacePluginOptions {
    modules: ConfigItem[];
}
export interface ModuleInfo {
    status: typeof ModuleStatus[keyof typeof ModuleStatus];
    replacedModule: string;
    compilers: Set<Compiler>;
    loaders?: {
        loader: string;
        options: Record<string, any>;
    }[];
}
declare const ModuleStatus: {
    readonly REPLACED: 1;
    readonly ORIGINAL: 2;
};
export default class ModuleReplacePlugin implements Plugin {
    private _options;
    static restoreModule(id: string): void;
    constructor(options: Partial<ModuleReplacePluginOptions>);
    apply(compiler: Compiler): void;
    private _handleBuildModule;
    private _collectModules;
    private _getReplacedModule;
}
export {};
