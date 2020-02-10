import React from "react";
import ReactFS from "@shuvi/react-fs";
import fse from "fs-extra";
import {
  AppCore,
  Paths,
  TemplateData,
  BuildOptions,
  AppConfig
} from "@shuvi/types/core";
import App from "./App";
import { getPaths } from "./paths";
import {
  initBootstrap,
  addSelectorFile,
  addTemplateFile,
  addFile,
  setRoutesSource
} from "./store";
import { swtichOffLifeCycle, swtichOnLifeCycle } from "./components/Base";
import { joinPath } from "./utils";

export interface AppOptions {
  config: AppConfig;
}

class AppCoreImpl implements AppCore {
  public config: AppConfig;
  public paths: Paths;

  constructor({ config }: AppOptions) {
    this.config = config;
    this.paths = getPaths({
      cwd: this.config.cwd,
      outputPath: this.config.outputPath
    });
  }

  resolveAppFile(filename: string): string {
    return joinPath(this.paths.appDir, filename);
  }

  resolveSrcFile(filename: string): string {
    return joinPath(this.paths.srcDir, filename);
  }

  resolveBuildFile(filename: string): string {
    return joinPath(this.paths.buildDir, filename);
  }

  getPublicUrlPath(buildPath: string): string {
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

  setRoutesSource(content: string): void {
    setRoutesSource(content);
  }

  async build(options: BuildOptions): Promise<void> {
    initBootstrap({ bootstrapFilePath: options.bootstrapFilePath });
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

export function app(options: AppOptions): AppCore {
  return new AppCoreImpl(options);
}
