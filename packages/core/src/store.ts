import create from "zustand";
import produce from "immer";
import { FileNode, FileType, FileNodeType, TemplateData } from "@shuvi/types/core";

interface State {
  bootstrapFile: string;
  files: FileNode[];
}

interface FileNodeOptions {
  type: FileType;
  [x: string]: any;
}

interface Actions {
  set(fn: (state: State) => void): void;
  addFileNode(path: string, options: FileNodeOptions): void;
}

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

  let node: FileNode | undefined = {
    name: "root",
    $$type: "dir",
    children: files
  };

  if (path === "") {
    return node;
  }

  const segs = path.split("/").reverse();
  while (segs.length) {
    if (!node || node.$$type !== "dir") return;

    const searchName = segs.pop();
    node = node.children.find(file => file.name === searchName);
  }

  return node;
}

function ensureDir(path: string, files: FileNode[]): void {
  const node = findByPath(path, files);
  if (node) {
    if (node.$$type !== "dir") {
      throw new Error(`File "${node.name}" existed`);
    }

    return;
  } else {
    const { dirname, name } = getDirAndName(path);
    ensureDir(dirname, files);
    addFileNode(name, "dir", { children: [] }, files);
  }
}

function addFileNode(
  path: string,
  type: FileNodeType,
  props: any,
  files: FileNode[]
) {
  const { dirname, name } = getDirAndName(path);
  const node = findByPath(dirname, files);
  if (!node || node.$$type !== "dir") return;

  node.children.push({
    ...props,
    $$type: type,
    name
  });
}

const [useStore, store] = create<State & Actions>(_set => {
  const set = (fn: (s: State) => void) =>
    _set(
      produce(state => {
        fn(state);
      })
    );

  return {
    bootstrapFile: "",
    files: [],
    set,
    addFileNode(path: string, props: FileNodeOptions) {
      set(state => {
        const { dirname } = getDirAndName(path);
        ensureDir(dirname, state.files);
        addFileNode(path, "file", props, state.files);
      });
    },
    removeFile(path: string) {
      set(state => {
        const { dirname, name } = getDirAndName(path);
        const node = findByPath(dirname, state.files);
        if (!node || node.$$type !== "dir") return;

        const index = node.children.findIndex(file => file.name === name);
        if (index >= 0) {
          node.children.splice(index, 1);
        }
      });
    },
    updateFile(path: string, updateFn: any) {
      set(state => {
        const node = findByPath(path, state.files);
        if (!node || node.$$type !== "dir") return;

        updateFn(node);
      });
    }
  };
});

function updateStore(fn: (state: State) => void) {
  store.getState().set(fn);
}

export function initBootstrap(options: { bootstrapFile: string }) {
  updateStore(state => (state.bootstrapFile = options.bootstrapFile));
}

export function addSelectorFile(
  path: string,
  files: string[],
  fallbackFile: string
) {
  store.getState().addFileNode(path, {
    files,
    fallbackFile,
    type: "selector"
  });
}

export function addTemplateFile(
  path: string,
  templateFile: string,
  data: TemplateData
) {
  store.getState().addFileNode(path, {
    templateFile,
    data,
    type: "template"
  });
}

export function addFile(path: string, content: string) {
  store.getState().addFileNode(path, { type: "normal", content });
}

export { useStore };
