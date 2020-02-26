import { observable } from "mobx";
import { File } from "./FileNode";

export interface ModelPriorityFileOptions {
  files: string[];
  fallback: string;
}

export class ModelPriorityFile extends File {
  @observable files: string[];
  @observable fallback: string;

  constructor(name: string, options: ModelPriorityFileOptions) {
    super(name);
    this.files = options.files;
    this.fallback = options.fallback;
  }
}
