import { FileNode, File } from "./files/FileNode";
export declare class ModelApp {
    bootstrapModule: string;
    appModuleFallback: string;
    appModuleLookups: string[];
    documentModuleFallback: string;
    documentModuleLookups: string[];
    routesContent: string;
    extraFiles: FileNode[];
    addFile(file: File, dir?: string): void;
    removeFile(path: string): void;
}
