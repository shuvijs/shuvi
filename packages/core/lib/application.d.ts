import { AppCore, AppConfig, RouterService } from "@shuvi/types/core";
export interface AppOptions {
    config: AppConfig;
    routerService: RouterService;
}
export declare function app(options: AppOptions): AppCore;
