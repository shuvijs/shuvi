import path from "path";
import { ApplicationConfig, Paths } from "./types/application";
import {
  Resource,
  ResourceType,
  CommonResourceOptions
} from "./types/resource";
import { templateResource, derivativeResource } from "./resource";
import { getPaths } from "./paths";

export interface ApplicationOptions {
  config: ApplicationConfig;
}

export class Application {
  public config: ApplicationConfig;
  public paths: Paths;
  public resourceMap = new Map<ResourceType, Resource[]>();

  constructor({ config }: ApplicationOptions) {
    this.config = config;
    this.paths = getPaths({
      cwd: this.config.cwd,
      outputPath: this.config.outputPath
    });
  }

  getPublicPath(buildPath: string): string {
    const stripEndSlash = this.config.publicPath.replace(/\/+$/, "");
    const stripBeginSlash = buildPath.replace(/^\/+/, "");
    return `${stripEndSlash}/${stripBeginSlash}`;
  }

  addTemplate(res: CommonResourceOptions): this {
    return this._addResource(templateResource(res));
  }

  addDerivative(res: CommonResourceOptions): this {
    return this._addResource(derivativeResource(res));
  }

  async buildResources(): Promise<void> {
    await Promise.all(this.getResources().map(r => r.build()));
  }

  getResources(type?: string) {
    if (type) {
      return this.resourceMap.get(type) || [];
    }

    const res: Resource[] = [];
    for (const [_, resources] of this.resourceMap.entries()) {
      Array.prototype.push.apply(res, resources);
    }
    return res;
  }

  private _addResource(res: Resource): this {
    let { type, name } = res;
    if (!this.resourceMap.has(type)) {
      this.resourceMap.set(type, []);
    }

    if (path.isAbsolute(name)) {
      // TODO: warning
    } else {
      name = path.join(this.paths.appDir, name);
    }

    const list = this.resourceMap.get(type)!;
    list.push({
      ...res,
      name
    });
    return this;
  }

  /**
   * resource path format: [namespcae//]path
   */
  private _resolveResourcePath(res: Resource): this {
    const { type } = res;
    if (!this.resourceMap.has(type)) {
      this.resourceMap.set(type, []);
    }

    const list = this.resourceMap.get(type)!;
    list.push(res);
    return this;
  }
}

export function app(options: ApplicationOptions) {
  return new Application(options);
}
