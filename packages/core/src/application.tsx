import React from "react";
import ReactFS from "@shuvi/react-fs";
import fse from "fs-extra";
import { Paths } from "./types";
import App from "./App";
import { getPaths } from "./paths";
import { initBootstrap, addSelectorFile } from "./store";
import { swtichOffLifeCycle, swtichOnLifeCycle } from "./components/Base";
import { joinPath } from "./utils";

export interface ApplicationConfig {
  cwd: string;
  outputPath: string;
  publicPath: string;
}

export interface ApplicationOptions {
  config: ApplicationConfig;
}

export interface BuildOptions {
  bootstrapSrc: string;
}

class ApplicationClass {
  public config: ApplicationConfig;
  public paths: Paths;

  constructor({ config }: ApplicationOptions) {
    this.config = config;
    this.paths = getPaths({
      cwd: this.config.cwd,
      outputPath: this.config.outputPath
    });
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

  async build(options: BuildOptions): Promise<void> {
    initBootstrap({ bootstrapSrc: options.bootstrapSrc });
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
