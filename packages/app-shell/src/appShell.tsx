import React from "react";
import { useStaticRendering } from "mobx-react";
import ReactFS from "@shuvi/react-fs";
import fse from "fs-extra";
import App from "./App";
import { File } from "./models/files";
import { Store, createStore, StoreProvider } from "./models/store";
import { swtichOffLifeCycle, swtichOnLifeCycle } from "./components/Base";
import { AppShell, BuildOptions } from "./types";

class AppCoreImpl implements AppShell {
  private _store: Store;
  private _onBuildDoneCbs: Array<() => void> = [];

  constructor() {
    this._store = createStore();
  }

  setBootstrapModule(module: string) {
    this._store.bootstrapModule = module;
  }

  setAppModule(lookups: string[], fallback: string) {
    this._store.appModuleFallback = fallback;
    this._store.appModuleLookups = lookups;
  }

  setDocumentModule(lookups: string[], fallback: string) {
    this._store.documentModuleFallback = fallback;
    this._store.documentModuleLookups = lookups;
  }

  setRoutesSource(content: string): void {
    this._store.routesContent = content;
  }

  addFile(file: File): void {
    this._store.addFile(file);
  }

  waitUntilBuild(): Promise<void> {
    return new Promise(resolve => {
      this._onBuildDoneCbs.push(resolve);
    });
  }

  async build(options: BuildOptions): Promise<void> {
    await fse.emptyDir(options.dir);

    return new Promise(resolve => {
      ReactFS.render(
        <StoreProvider store={this._store}>
          <App onDidRender={this._onBuildDone.bind(this)} />
        </StoreProvider>,
        options.dir,
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

export function appShell(): AppShell {
  return new AppCoreImpl();
}
