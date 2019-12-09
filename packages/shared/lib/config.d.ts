interface LoadConfigOption<T> {
    overrides?: T;
}
export declare function loadConfig<T>(configPath: string, options?: LoadConfigOption<T>): Promise<T>;
export {};
