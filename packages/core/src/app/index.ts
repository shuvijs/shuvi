import {
  createFile,
  createModuleProxy,
  createCustomFile,
  createModule,
  File as FileClass
} from "./models/files";

const File = {
  file: createFile,
  module: createModule,
  moduleProxy: createModuleProxy,
  customFile: createCustomFile
};

export type IFile = InstanceType<typeof FileClass>;

export { File };

export { App } from "./app";

export * from "./types";
