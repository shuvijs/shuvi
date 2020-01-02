import {
  Resource,
  ResourceId,
  ResourceType,
  ResourceConstructionOptions,
  CommonResourceOptions
} from "./types/resource";

let uid = 0;
class ResourceImpl implements Resource {
  id: ResourceId = uid++;
  type: ResourceType;
  name: string;
  outputPath: string;

  constructor({ name, type, outputPath }: ResourceConstructionOptions) {
    this.name = name;
    this.type = type;
    this.outputPath = outputPath;
  }

  async build(): Promise<void> {
    // TODO: build
    return;
  }
}

export function templateResource({
  name,
  outputPath
}: CommonResourceOptions): Resource {
  return new ResourceImpl({ name, outputPath, type: "template" });
}

export function derivativeResource({
  name,
  outputPath
}: CommonResourceOptions): Resource {
  return new ResourceImpl({ name, outputPath, type: "derivative" });
}
