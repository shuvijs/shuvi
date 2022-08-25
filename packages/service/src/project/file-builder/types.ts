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

export type FileInfo = {
  /** timestamp that the file changes */
  timestamp: number;
};

/**
 * Infos for a buildOnce
 */
export type BuildInfo = {
  /**
   * uuid of this buildOnce
   */
  id: string;
  /**
   * All files included in this build. Will never change
   */
  files: ReadonlySet<FileId>;
  /**
   * The set of ids of the buildOnces which are in front of this buildOnce
   */
  fronts: Set<string>;
  /**
   * The set of ids of the buildOnces which are in rear of this buildOnce
   */
  rears: Set<string>;
  /**
   * changed files that includes all the changed files of all the fronts.
   */
  collectedChangedFiles: Map<FileId, FileInfo>;
};

export type FileStatus = {
  /** whether this file has been built*/
  updated: boolean;
  /** whether this file has changed after build */
  changed: boolean;
  changedTime?: number;
};

export type BuildRunningInfo = {
  filesStatusMap: Map<FileId, FileStatus>;
  /**
   * Files waiting to be built in this build. Will change until be cleared.
   */
  pendingFiles: Set<FileId>;
};

export type FilesInfo = {
  filesStatusMap: Map<FileId, FileStatus>;
  /**
   * Files waiting to be built in this build. Will change until be cleared.
   */
  pendingFiles: Set<FileId>;
};
