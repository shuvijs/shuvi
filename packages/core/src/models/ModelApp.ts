import { observable, action } from "mobx";
import { FileNode, Dir, isDir, File } from "./files/FileNode";

function getDirAndName(path: string) {
  const segs = path.split("/");
  const [name] = segs.splice(-1, 1);

  return {
    name,
    dirname: segs.join("/")
  };
}

function findByPath(path: string, files: FileNode[]): FileNode | undefined {
  path = path.replace(/^\//, "");

  let node: FileNode | undefined = new Dir("root", files);

  if (path === "") {
    return node;
  }

  const segs = path.split("/").reverse();
  while (segs.length) {
    if (!node || !isDir(node)) return;

    const searchName = segs.pop();
    node = node.children.find(file => file.name === searchName);
  }

  return node;
}

function ensureDir(path: string, files: FileNode[]): void {
  const node = findByPath(path, files);
  if (node) {
    if (!isDir(node)) {
      throw new Error(`File "${node.name}" existed`);
    }

    return;
  } else {
    const { dirname, name } = getDirAndName(path);
    ensureDir(dirname, files);
    addFileNode(dirname, new Dir(name), files);
  }
}

function addFileNode(dir: string, file: FileNode, files: FileNode[]) {
  const node = findByPath(dir, files);
  if (!node || !isDir(node)) return;

  node.children.push(file);
}

export class ModelApp {
  @observable bootstrapModule!: string;
  @observable appModuleFallback!: string;
  @observable appModuleLookups!: string[];
  @observable documentModuleFallback!:string;
  @observable documentModuleLookups!:string[];
  @observable routesContent: string = 'export default []';
  @observable extraFiles: FileNode[] = [];

  @action
  addFile(file: File, dir: string = "/") {
    const files = this.extraFiles;
    ensureDir(dir, files);
    addFileNode(dir, file, files);
  }

  @action
  removeFile(path: string) {
    const files = this.extraFiles;
    const { dirname, name } = getDirAndName(path);
    const node = findByPath(dirname, files);
    if (!node || !isDir(node)) return;

    const index = node.children.findIndex(file => file.name === name);
    if (index >= 0) {
      node.children.splice(index, 1);
    }
  }
}
