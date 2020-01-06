declare type Application = import("../application").Application;
export declare type ResourceId = number;
export declare type ResourceSrc = string;
export interface ResourceConstructionOptions {
    name: string;
    src: ResourceSrc;
}
export declare type BuildResourceFn = (app: Application) => Promise<void>;
export declare class Resource {
    id: ResourceId;
    src: ResourceSrc;
    name: string;
    constructor({ name, src }: ResourceConstructionOptions);
    build(app: Application): Promise<string>;
}
export {};
