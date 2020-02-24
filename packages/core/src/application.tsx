import React from "react";
import path from "path";
import { useStaticRendering } from "mobx-react";
import ReactFS from "@shuvi/react-fs";
import fse from "fs-extra";
import { AppCore, Paths, BuildOptions, AppConfig } from "@shuvi/types/core";
import App from "./App";
import { getPaths } from "./paths";
import { store } from "./models/store";
import { swtichOffLifeCycle, swtichOnLifeCycle } from "./components/Base";

export interface AppOptions {
  config: AppConfig;
}

class AppCoreImpl implements AppCore {
  public config: AppConfig;
  public paths: Paths;
  private _onBuildDoneCbs: Array<() => void> = [];

  constructor({ config }: AppOptions) {
    this.config = config;
    this.paths = getPaths({
      cwd: this.config.cwd,
      outputPath: this.config.outputPath
    });
  }

  resolveInternalFile(...paths: string[]): string {
    return path.join(__dirname, "app", ...paths);
  }

  setBootstrapModule(module: string) {
    store.bootstrapModule = module;
  }

  setAppModule(lookups: string[], fallback: string) {
    store.appModuleFallback = fallback;
    store.appModuleLookups = lookups;
  }

  setDocumentModule(lookups: string[], fallback: string) {
    store.documentModuleFallback = fallback;
    store.documentModuleLookups = lookups;
  }

  setRoutesSource(content: string): void {
    store.routesContent = content;
  }

  waitUntilBuild(): Promise<void> {
    return new Promise(resolve => {
      this._onBuildDoneCbs.push(resolve);
    });
  }

  async build(options: BuildOptions): Promise<void> {
    await fse.emptyDir(this.paths.appDir);

    return new Promise(resolve => {
      ReactFS.render(
        <App onDidUpdate={this._onBuildDone.bind(this)} />,
        this.paths.appDir,
        () => {
          resolve();
        }
      );
    });
  }

  async buildOnce(options: BuildOptions): Promise<void> {
    useStaticRendering(true);
    swtichOffLifeCycle();
    try {
      await this.build(options);
    } finally {
      swtichOnLifeCycle();
      useStaticRendering(false);
    }
  }

  private _onBuildDone() {
    while (this._onBuildDoneCbs.length) {
      const cb = this._onBuildDoneCbs.shift()!;
      cb();
    }
  }
}

export function createApp(options: AppOptions): AppCore {
  return new AppCoreImpl(options);
}
