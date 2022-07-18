type FileDependency = string | FileOption<any>;

type ContentFunction<T, C> = (
  context: C,
  watcherOptions: any,
  oldContent: T
) => T | Promise<T>;

interface FileOption<T = string, C = any> {
  name?: string;
  id: string;
  virtual?: boolean;
  content: ContentFunction<T, C>;
  dependencies?: FileDependency[];
}

type FileOptionWithoutId<T = string, C = any> = Omit<FileOption<T, C>, 'id'>;

export interface FileInternalInstance<T = string, C = any> {
  id: string;
  name: string;
  isVirtual: boolean;

  /**
   * The reactive effect for rendering and patching the component. Callable.
   */
  update: any;
  destroy: any;
  /**
   * The render function that returns vdom tree.
   */
  contentFunction: ContentFunction<T, C>;
  /**
   * cache for proxy access type to avoid hasOwnProperty calls
   */

  fileContent: T;
  // the rest are only for stateful components ---------------------------------

  // state
  /**
   * This is the target for the public instance proxy. It also holds properties
   * injected by user options (computed, methods etc.) and user-attached
   * custom properties (via `this.x = ...`)
   */
  // ctx: Data;

  // lifecycle
  /* isMounted: boolean;
  isUnmounted: boolean;
  mounted: Function[];
  unmounted: Function[]; */
}

interface DefineFile {
  <T = string, C = any>(fileOption: FileOptionWithoutId<T>): FileOption<T>;
}

export const defineFile: DefineFile = <T = string>(
  fileOption: FileOptionWithoutId<T>
) => {
  return {
    ...fileOption,
    id: ''
  };
};

interface FileBuilder {
  addFile: (...newFileOption: FileOption<any>[]) => void;
  build: (dir?: string) => Promise<void>;
  watch: (dir?: string) => Promise<void>;
  close: () => Promise<void>;
  getContent: <T>(fileOption: FileOption<T>) => T;
}

export const getFileBuilder = (): FileBuilder => {
  const fileOptions: FileOption<any>[] = [];
  // @ts-ignore
  const files: Map<string, FileInternalInstance>[] = [];
  const addFile = (...newFileOption: FileOption<any>[]) => {
    fileOptions.push(...newFileOption);
  };
  // @ts-ignore
  const createInstance = (fileOption: FileOption<any>) => {};
  // @ts-ignore
  const buildGraph = () => {};

  const build = async (dir: string = '/') => {
    // @ts-ignore
    const buildFile = async (id: string) => {};
    // @ts-ignore
    const ifDependenciesResolved = (id: string): boolean => {
      return false;
    };
  };
  const watch = async () => {};
  const close = async () => {};
  const getContent = <T>(fileOption: FileOption<T>) => {
    return {} as T;
  };
  return {
    addFile,
    build,
    watch,
    close,
    getContent
  };
};
