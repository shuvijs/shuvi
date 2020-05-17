import React from 'react';
import { useStaticRendering } from 'mobx-react';
import ReactFS from '@shuvi/react-fs';
import AppComponent from './AppComponent';
import { File } from './models/files';
import { Store, createStore, StoreProvider } from './models/store';
import { IBuildOptions, ISpecifier } from './types';

export class App {
  private _store: Store;

  constructor() {
    this._store = createStore();
  }

  setRendererModule(module: string) {
    this._store.rendererModule = module;
  }

  setAppModule(module: string | string[]) {
    this._store.appModule = module;
  }

  setRoutesContent(content: string): void {
    this._store.routesContent = content;
  }

  addEntryCode(content: string): void {
    this._store.addEntryCode(content);
  }

  addFile(file: File, dir: string = '/'): void {
    this._store.addFile(file, dir);
  }

  addExport(source: string, specifier: ISpecifier | ISpecifier[]): void {
    this._store.addExport(source, ([] as ISpecifier[]).concat(specifier));
  }

  addPolyfill(file: string): void {
    this._store.addPolyfill(file);
  }

  async build(options: IBuildOptions): Promise<void> {
    return new Promise(resolve => {
      ReactFS.render(this._getRootComp(), options.dir, () => {
        resolve();
      });
    });
  }

  stopBuild(dir: string) {
    return ReactFS.unmount(dir);
  }

  async buildOnce(options: IBuildOptions): Promise<void> {
    useStaticRendering(true);
    try {
      await ReactFS.renderOnce(this._getRootComp(), options.dir);
    } finally {
      useStaticRendering(false);
    }
  }

  private _getRootComp() {
    return (
      <StoreProvider store={this._store}>
        <AppComponent />
      </StoreProvider>
    );
  }
}
