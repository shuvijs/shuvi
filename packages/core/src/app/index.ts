import {
  createFile,
  createModuleCollection,
  createCustomFile,
  createModule,
  File as FileClass
} from "./models/files";

const File = {
  file: createFile,
  module: createModule,
  moduleCollection: createModuleCollection,
  customFile: createCustomFile
};

export type IFile = InstanceType<typeof FileClass>;

export { File };

export { App } from "./app";

export * from "./types";
