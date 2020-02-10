import { AppCore, AppConfig } from "@shuvi/types/core";
export interface AppOptions {
    config: AppConfig;
}
export declare function app(options: AppOptions): AppCore;
