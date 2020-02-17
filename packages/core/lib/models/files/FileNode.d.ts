export declare type FileNode = File | Dir;
export declare class File {
    name: string;
    constructor(name: string);
}
export declare class Dir {
    name: string;
    children: FileNode[];
    constructor(name: string, children?: FileNode[]);
}
export declare function isDir(obj: any): obj is Dir;
export declare function isFile(obj: any): obj is File;
