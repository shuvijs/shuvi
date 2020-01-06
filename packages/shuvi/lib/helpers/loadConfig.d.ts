import { ApplicationConfig } from "@shuvi/core";
interface LoadConfigOption<T> {
    overrides?: T;
}
export declare function loadConfigFromFile<T>(configPath: string, options?: LoadConfigOption<T>): Promise<T>;
export declare function loadConfig(): Promise<Partial<ApplicationConfig>>;
export {};
