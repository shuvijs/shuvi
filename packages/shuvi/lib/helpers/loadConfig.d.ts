import { AppConfig } from "@shuvi/types/core";
interface LoadConfigOption<T> {
    overrides?: T;
}
export declare function loadConfigFromFile<T>(configPath: string, options?: LoadConfigOption<T>): Promise<T>;
export declare function loadConfig(): Promise<Partial<AppConfig>>;
export {};
