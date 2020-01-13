export declare type Type = "file" | "dir";
export declare type FsNode = JSX.Element | null | undefined;
export interface DirProps {
    name: string;
    children?: FsNode[] | FsNode | null | undefined;
}
export interface FileProps {
    name: string;
    content: string;
}
export declare const Types: Record<string, Type>;
