import { observable } from "mobx";

export type IFileNode = File | Dir;

export class File {
  @observable name: string;
  @observable.ref type: React.ComponentType<any>;
  @observable props: any;

  constructor(name: string, type: React.ComponentType<any>, props: any) {
    this.name = name;
    this.type = type;
    this.props = props;
  }
}

export class Dir {
  @observable name: string;

  children: IFileNode[];

  constructor(name: string, children: IFileNode[] = []) {
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
