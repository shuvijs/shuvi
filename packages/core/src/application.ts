import path from "path";
import fse from "fs-extra";
import { Paths } from "./types";
import { Resource } from "./resource";
import { Bootstrap } from "./bootstrap";
import { getPaths } from "./paths";

export interface ApplicationConfig {
  cwd: string;
  outputPath: string;
  publicPath: string;
}

export interface ApplicationOptions {
  config: ApplicationConfig;
}

class ApplicationClass {
  public config: ApplicationConfig;
  public paths: Paths;

  private _bootstrap: Bootstrap = new Bootstrap();

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

  getBootstrapModule(): Bootstrap {
    return this._bootstrap;
  }

  async build(): Promise<void> {
    await fse.emptyDir(this.paths.appDir);
    await this._bootstrap.build(this);
    // await Promise.all(this.getResources().map(r => r.build(this)));
    return;
  }

  async buildResource(moduleName: string, res: Resource): Promise<void> {
    const content = await res.build(this);
    const output = path.join(this.paths.appDir, moduleName, res.name);
    await fse.ensureDir(path.dirname(output));
    return fse.writeFile(output, content, { encoding: "utf8" });
  }

  // getResources(type?: string) {
  //   // if (type) {
  //   //   return this.resourceMap.get(type) || [];
  //   // }

  //   // const res: Resource[] = [];
  //   // for (const [_, resources] of this.resourceMap.entries()) {
  //   //   Array.prototype.push.apply(res, resources);
  //   // }
  //   // return res;
  //   return []
  // }

  // private _addResource(res: Resource): this {
  //   let { type, name } = res;
  //   if (!this.resourceMap.has(type)) {
  //     this.resourceMap.set(type, []);
  //   }

  //   if (path.isAbsolute(name)) {
  //     // TODO: warning
  //   } else {
  //     name = path.join(this.paths.appDir, name);
  //   }

  //   const list = this.resourceMap.get(type)!;
  //   list.push({
  //     ...res,
  //     name
  //   });
  //   return this;
  // }

  // /**
  //  * resource path format: [namespcae//]path
  //  */
  // private _resolveResourcePath(res: Resource): this {
  //   const { type } = res;
  //   if (!this.resourceMap.has(type)) {
  //     this.resourceMap.set(type, []);
  //   }

  //   const list = this.resourceMap.get(type)!;
  //   list.push(res);
  //   return this;
  // }
}

export type Application = ApplicationClass;

export function app(options: ApplicationOptions) {
  return new ApplicationClass(options);
}
