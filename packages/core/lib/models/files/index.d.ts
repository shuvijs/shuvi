import { ModelFile, ModelFileOptions } from "./ModelFile";
import { ModelPriorityFile, ModelPriorityFileOptions } from "./ModelPriorityFile";
export { File, Dir, FileNode, isDir, isFile } from "./FileNode";
export declare function createFile(name: string, options: ModelFileOptions): ModelFile;
export declare function createPriorityFile(name: string, options: ModelPriorityFileOptions): ModelPriorityFile;
export declare function isTemplateFile(obj: any): obj is ModelFile;
export declare function isPriorityFile(obj: any): obj is ModelPriorityFile;
