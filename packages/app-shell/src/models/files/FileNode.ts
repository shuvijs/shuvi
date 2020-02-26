import { observable } from "mobx";

export type FileNode = File | Dir;

export class File {
  @observable name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export class Dir {
  @observable name: string;

  children: FileNode[];

  constructor(name: string, children: FileNode[] = []) {
    this.name = name;
    this.children = children;
  }
}

export function isDir(obj: any): obj is Dir {
  return obj instanceof Dir;
}

export function isFile(obj: any): obj is File {
  return obj instanceof File;
}
