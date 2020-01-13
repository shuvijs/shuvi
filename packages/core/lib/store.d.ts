import { FileNode } from "./types/file";
interface State {
    bootstrapSrc: string;
    files: FileNode[];
}
interface Actions {
    set(fn: (state: State) => void): void;
    addFile(path: string, props: any): void;
}
declare const useStore: import("zustand").UseStore<State & Actions>;
export declare function initBootstrap(options: {
    bootstrapSrc: string;
}): void;
export declare function addGatewayFile(path: string, files: string[]): void;
export { useStore };
