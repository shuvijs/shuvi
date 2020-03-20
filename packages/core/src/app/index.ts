import {
  createFile,
  createModuleCollection,
  createCustomFile,
  File as FileClass
} from "./models/files";

const File = {
  file: createFile,
  moduleCollection: createModuleCollection,
  customFile: createCustomFile
};

export type IFile = InstanceType<typeof FileClass>;

export { File };

export { App } from "./app";

export * from "./types";
