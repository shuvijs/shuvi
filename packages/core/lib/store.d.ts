import { FileNode, FileType } from "./types/file";
interface State {
    bootstrapSrc: string;
    files: FileNode[];
}
interface FileProps {
    type: FileType;
    [x: string]: any;
}
interface Actions {
    set(fn: (state: State) => void): void;
    addFile(path: string, props: FileProps): void;
}
declare const useStore: import("zustand").UseStore<State & Actions>;
export declare function initBootstrap(options: {
    bootstrapSrc: string;
}): void;
export declare function addSelectorFile(path: string, files: string[], fallbackFile: string): void;
export { useStore };
