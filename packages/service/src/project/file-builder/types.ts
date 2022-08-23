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
  fullPath?: string;
  id: FileId;
  virtual?: boolean;
  content: ContentFunction<T, C>;
  fileContent?: T;
}

export type DefineFile = <T = string, C = any>(
  fileOption: FileOptionWithoutId<T, C>
) => FileOption<T, C>;

export type DependencyInfo = {
  dependencies: Set<FileId>;
  dependents: Set<FileId>;
};

/**
 * Infos for a buildOnce
 */
export type BuildInfo = {
  id: string;
  /**
   * All files included in this build. Will never change
   */
  files: ReadonlySet<FileId>;
  /**
   * Files waiting to be built in this build. Will change until be cleared.
   */
  pendingFiles: Set<FileId>;
  fronts: Set<string>;
  rears: Set<string>;
};

export type FileStatus = {
  updated: boolean;
  noChange?: boolean;
};

export type FilesInfo = {
  filesStatusMap: Map<FileId, FileStatus>;
  /**
   * Files waiting to be built in this build. Will change until be cleared.
   */
  pendingFiles: Set<FileId>;
};
