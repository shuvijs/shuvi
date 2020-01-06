import { Resource, ResourceConstructionOptions } from "./resource";
import {
  TemplateResource,
  TemplateResourceClass,
  TemplateResourceConstructionOptions
} from "./templateResource";

export function createResource(opts: ResourceConstructionOptions): Resource {
  return new Resource(opts);
}

export function createTemplateResource(
  opts: TemplateResourceConstructionOptions
): TemplateResource {
  return new TemplateResourceClass(opts);
}
