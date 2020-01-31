import React from "react";
import ReactFS from "@shuvi/react-fs";
import fse from "fs-extra";
import { Paths } from "./types";
import { TemplateData } from "./types/file";
import { RouterService, RouteConfig } from "./types/services/routerService";
import App from "./App";
import { getPaths } from "./paths";
import {
  initBootstrap,
  addSelectorFile,
  addTemplateFile,
  addFile
} from "./store";
import { swtichOffLifeCycle, swtichOnLifeCycle } from "./components/Base";
import { joinPath } from "./utils";

export interface ApplicationConfig {
  cwd: string;
  outputPath: string;
  publicPath: string;
}

export interface ApplicationOptions {
  config: ApplicationConfig;
  routerService: RouterService;
}

export interface BuildOptions {
  bootstrapFile: string;
}

export interface RouterConfig {
  routes: RouteConfig[];
}

class ApplicationClass {
  public config: ApplicationConfig;
  public paths: Paths;
  private _routerService: RouterService;

  constructor({ config, routerService }: ApplicationOptions) {
    this.config = config;
    this.paths = getPaths({
      cwd: this.config.cwd,
      outputPath: this.config.outputPath
    });
    this._routerService = routerService;
  }

  getAppPath(filename: string): string {
    return joinPath(this.paths.appDir, filename);
  }

  getSrcPath(filename: string): string {
    return joinPath(this.paths.srcDir, filename);
  }

  getOutputPath(filename: string): string {
    return joinPath(this.paths.buildDir, filename);
  }

  getPublicPath(buildPath: string): string {
    return joinPath(this.config.publicPath, buildPath);
  }

  addSelectorFile(
    path: string,
    selectFileList: string[],
    fallbackFile: string
  ): void {
    addSelectorFile(path, selectFileList, fallbackFile);
  }

  addTemplateFile(
    path: string,
    templateFile: string,
    data: TemplateData = {}
  ): void {
    addTemplateFile(path, templateFile, data);
  }

  addFile(path: string, { content }: { content: string }): void {
    addFile(path, content);
  }

  async getRouterConfig(): Promise<RouterConfig> {
    const routes = await this._routerService.getRoutes();
    return {
      routes
    };
  }

  async build(options: BuildOptions): Promise<void> {
    initBootstrap({ bootstrapFile: options.bootstrapFile });
    await fse.emptyDir(this.paths.appDir);

    return new Promise(resolve => {
      ReactFS.render(<App />, this.paths.appDir, () => {
        resolve();
      });
    });
  }

  async buildOnce(options: BuildOptions): Promise<void> {
    swtichOffLifeCycle();
    try {
      await this.build(options);
    } finally {
      swtichOnLifeCycle();
    }
  }
}

export type Application = ApplicationClass;

export function app(options: ApplicationOptions) {
  return new ApplicationClass(options);
}
