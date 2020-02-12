import { ModuleManifest } from "@shuvi/types/build";
import { RouteConfig } from "@shuvi/types/core";
interface BuildRequireConstructionOptions {
    buildDir: string;
}
export default class BuildRequire {
    private _options;
    constructor(options: BuildRequireConstructionOptions);
    requireDocument(): any;
    requireApp(): {
        App: any;
        routes: RouteConfig[];
    };
    getEntryAssets(name: string): string[];
    getModules(): {
        [moduleId: string]: ModuleManifest[];
    };
    private _resolveServerModule;
    private _requireDefault;
    private _getServerManifest;
    private _getClientManifest;
    private _getManifest;
}
export {};
