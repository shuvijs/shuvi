import { Application } from "../application";
import { Resource, ResourceConstructionOptions } from "./resource";
export interface TemplateContextData {
    [x: string]: any;
}
export interface TemplateContext<T extends TemplateContextData = TemplateContextData> {
    set<K extends keyof T>(key: K, value: T[K]): void;
    getContext(): T;
}
export interface TemplateResourceConstructionOptions extends ResourceConstructionOptions {
    context: TemplateContext;
}
export declare function createTemplateContext<T = TemplateContextData>(): TemplateContext<T>;
export declare type TemplateResource = TemplateResourceClass;
export declare class TemplateResourceClass extends Resource {
    private _context;
    private _template;
    constructor({ context, ...parentOpts }: TemplateResourceConstructionOptions);
    build(app: Application): Promise<string>;
}
