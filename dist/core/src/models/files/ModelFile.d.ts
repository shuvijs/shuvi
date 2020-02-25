import { File } from "./FileNode";
export interface TemplateData {
    [x: string]: any;
}
export interface ModelFileOptions {
    template?: string;
    content?: string;
    data?: TemplateData;
}
export declare class ModelFile extends File {
    content?: string;
    template?: string;
    data?: TemplateData;
    constructor(name: string, options: ModelFileOptions);
}
