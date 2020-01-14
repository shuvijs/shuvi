export interface TemplateData {
  [x: string]: any;
}

export type FileType = "template" | "selector";

export type FileNodeType = "file" | "dir";

export interface TemplateFile {
  $$type: 'file',
  type: "template";
  name: string;
  template: string;
  data: TemplateData;
}

export interface SelectorFile {
  $$type: 'file',
  type: "selector";
  name: string;
  files: string[];
}

export type File = TemplateFile | SelectorFile;

export interface Dir {
  $$type: 'dir',
  name: string;
  children: Array<File | Dir>;
}

export type FileNode = File | Dir;
