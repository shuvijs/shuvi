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
    loaders?: {
        loader: string;
        options: Record<string, any>;
    }[];
}
declare const ModuleStatus: {
    readonly PendingReplaced: 1;
    readonly Replaced: 2;
    readonly PendingRestore: 3;
    readonly Restored: 4;
};
export default class ModuleReplacePlugin implements Plugin {
    private _options;
    constructor(options: ModuleReplacePluginOptions);
    apply(compiler: Compiler): void;
    restoreModule(id: string): void;
    private _collectModules;
    private _getReplacedModule;
}
export {};
