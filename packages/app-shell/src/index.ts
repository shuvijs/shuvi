import { createFile, createPriorityFile, File as IFile } from "./models/files";

const File = {
  file: createFile,
  priorityFile: createPriorityFile
};

export type FileType = IFile;

export { File };

export { appShell } from "./appShell";

export * from "./types";
