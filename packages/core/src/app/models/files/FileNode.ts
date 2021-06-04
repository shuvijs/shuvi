import { observable } from 'mobx';

const FILE_TYPE = Symbol.for('file');
const DIR_TYPE = Symbol.for('dir');

export type IFileNode = File | Dir;

export class File {
  $$type = FILE_TYPE;

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
  $$type = DIR_TYPE;

  @observable name: string;

  children: IFileNode[];

  constructor(name: string, children: IFileNode[] = []) {
    this.name = name;
    this.children = children;
  }
}

export function isDir(obj: any): obj is Dir {
  return obj && obj['$$type'] === DIR_TYPE;
}

export function isFile(obj: any): obj is File {
  return obj && obj['$$type'] === FILE_TYPE;
}
