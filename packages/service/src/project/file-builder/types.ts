export type FileId = string;

export type ContentFunction<T, C> = (
  context: C,
  oldContent: T
) => T | Promise<T>;

export type FileDependency = string | FileOption<any>;

export interface FileOption<T = string, C = any> {
  name?: string;
  id: FileId;
  virtual?: boolean;
  content: ContentFunction<T, C>;
  dependencies?: FileDependency[];
}

export type FileOptionWithoutId<T = string, C = any> = Omit<
  FileOption<T, C>,
  'id'
>;

export interface FileInternalInstance<T = string, C = any> {
  name?: string;
  id: FileId;
  virtual?: boolean;
  content: ContentFunction<T, C>;
  fileContent?: T;
}

/* export interface DefineFile {
  <T = string, C = any>(fileOption: FileOptionWithoutId<T, C>): FileOption<
    T,
    C
  >;
} */

export type DefineFile = <T = string, C = any>(
  fileOption: FileOptionWithoutId<T, C>
) => FileOption<T, C>;

export type DependencyInfo = {
  dependencies: Set<FileId>;
  dependents: Set<FileId>;
};

export type BuildInfo = {
  id: string;
  files: Set<FileId>;
  fronts: Set<string>;
  rears: Set<string>;
};

export type FileStatus = {
  updated: boolean;
  noChange?: boolean;
};

export type FilesInfo = {
  filesStatusMap: Map<FileId, FileStatus>;
  files: Set<FileId>;
};
