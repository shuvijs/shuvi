export interface TemplateData {
    [x: string]: any;
}
export declare type FileType = "template" | "gateway";
export interface TemplateFile {
    $$type: 'file';
    type: "template";
    name: string;
    template: string;
    data: TemplateData;
}
export interface GatewayFile {
    $$type: 'file';
    type: "gateway";
    name: string;
    files: string[];
}
export declare type File = TemplateFile | GatewayFile;
export interface Dir {
    $$type: 'dir';
    name: string;
    children: Array<File | Dir>;
}
export declare type FileNode = File | Dir;
