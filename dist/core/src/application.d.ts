import { AppCore, AppConfig } from "./types/core";
export interface AppOptions {
    config: AppConfig;
}
export declare function createApp(options: AppOptions): AppCore;
