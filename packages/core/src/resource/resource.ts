type Application = import("../application").Application;

export type ResourceId = number;

export type ResourceSrc = string;

export interface ResourceConstructionOptions {
  name: string;
  src: ResourceSrc;
}

export type BuildResourceFn = (app: Application) => Promise<void>;

let uid = 0;
export class Resource {
  id: ResourceId = uid++;

  src: ResourceSrc;

  name: string;

  constructor({ name, src }: ResourceConstructionOptions) {
    this.name = name;
    this.src = src;
  }

  async build(app: Application): Promise<string> {
    return "";
  }
}
