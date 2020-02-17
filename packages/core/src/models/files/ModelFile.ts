import { observable } from "mobx";
import { File } from "./FileNode";

export interface TemplateData {
  [x: string]: any;
}

export interface ModelFileOptions {
  template?: string;
  content?: string;
  data?: TemplateData;
}

export class ModelFile extends File {
  @observable content?: string;
  @observable template?: string;
  @observable data?: TemplateData;

  constructor(name: string, options: ModelFileOptions) {
    super(name);
    this.name = name;
    this.content = options.content;
    this.template = options.template;
    this.data = options.data;
  }
}
