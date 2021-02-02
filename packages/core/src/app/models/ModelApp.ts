import os from 'os';
import { observable, action, computed } from 'mobx';
import { IFileNode, Dir, isDir, File } from './files/FileNode';
import { getCodeSnippet } from '../utils/getCodeSnippet';
import { ISpecifier } from '../../types';

function getDirAndName(path: string) {
  const segs = path.split('/');
  const [name] = segs.splice(-1, 1);

  return {
    name,
    dirname: segs.join('/')
  };
}

function findByPath(path: string, files: IFileNode[]): IFileNode | undefined {
  path = path.replace(/^\//, '');

  let node: IFileNode | undefined = new Dir('root', files);

  if (path === '') {
    return node;
  }

  const segs = path.split('/').reverse();
  while (segs.length) {
    if (!node || !isDir(node)) return;

    const searchName = segs.pop();
    node = node.children.find(file => file.name === searchName);
  }

  return node;
}

function ensureDir(path: string, files: IFileNode[]): void {
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

function addFileNode(dir: string, file: IFileNode, files: IFileNode[]) {
  const node = findByPath(dir, files);
  if (!node || !isDir(node)) return;

  node.children.push(file);
}

export class ModelApp {
  @observable viewModule!: string;
  @observable appModule!: string | string[];
  @observable pluginModule!: string | string[];
  @observable entryCodes: string[] = [];
  @observable entryFileContent!: string;
  @observable routesContent: string = 'export default []';
  @observable extraFiles: IFileNode[] = [];
  @observable polyfills: string[] = [];
  @observable exports = new Map<string, ISpecifier[]>();
  @observable runtimePlugins = new Map<string, string>();

  @computed
  get bootstrapContent(): string {
    const codes = this.entryCodes;
    let imports = '';
    let body = '';
    for (let index = 0; index < codes.length; index++) {
      const code = codes[index];
      const snippet = getCodeSnippet(code);
      if (snippet.imports) {
        imports += `${snippet.imports}${os.EOL}`;
      }

      if (snippet.body) {
        body += `${snippet.body}${os.EOL}`;
      }
    }

    return `${imports}${os.EOL}${body}`;
  }

  @action
  setEntryFileContent(file: string) {
    this.entryFileContent = file;
  }

  @action
  addEntryCode(content: string) {
    this.entryCodes.push(content);
  }

  @action
  addExport(source: string, specifier: ISpecifier[]) {
    this.exports.set(source, specifier);
  }

  @action
  addPolyfill(file: string) {
    if (!this.polyfills.includes(file)) {
      this.polyfills.push(file);
    }
  }

  @action
  addFile(file: File, dir: string = '/') {
    const files = this.extraFiles;
    ensureDir(dir, files);
    addFileNode(dir, file, files);
  }

  @action
  addRuntimePlugin(name: string, runtimePlugin: string) {
    this.runtimePlugins.set(name, runtimePlugin);
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
