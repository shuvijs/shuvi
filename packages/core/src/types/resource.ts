export type ResourceId = number;

export type ResourceType = "template" | "derivative" | string;

export interface Resource {
  id: ResourceId;
  type: ResourceType;
  name: string;
  outputPath: string;

  build(): Promise<void>;
}

export interface ResourceConstructionOptions {
  type: ResourceType;
  name: string;
  outputPath: string;
}

export type CommonResourceOptions = Omit<ResourceConstructionOptions, "type">;
