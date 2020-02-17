import { File } from "./FileNode";
export interface ModelPriorityFileOptions {
    files: string[];
    fallback: string;
}
export declare class ModelPriorityFile extends File {
    files: string[];
    fallback: string;
    constructor(name: string, options: ModelPriorityFileOptions);
}
