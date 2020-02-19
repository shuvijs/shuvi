import path from "path";
import {
  Manifest,
  Module,
  AssetMap
} from "@shuvi/toolpack/lib/webpack/plugins/build-manifest-plugin";
import {
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_DOCUMENT,
  BUILD_SERVER_APP
} from "../constants";
import { RouteConfig } from "@shuvi/types/core";

export type ModuleManifest = Module;

interface ModuleLoaderConstructionOptions {
  buildDir: string;
}

export class ModuleLoader {
  private _options: ModuleLoaderConstructionOptions;

  constructor(options: ModuleLoaderConstructionOptions) {
    this._options = options;
  }

  requireDocument(): any {
    return this._requireDefault(
      this._resolveServerModule(BUILD_SERVER_DOCUMENT)
    );
  }

  requireApp(): { App: any; routes: RouteConfig[] } {
    return require(this._resolveServerModule(BUILD_SERVER_APP));
  }

  getEntryAssets(name: string): AssetMap {
    const manifest = this._getClientManifest();
    return manifest.entries[name];
  }

  getModules(): { [moduleId: string]: Module } {
    const manifest = this._getClientManifest();
    return manifest.modules;
  }

  private _resolveServerModule(name: string) {
    const manifest = this._getServerManifest();
    return path.join(
      this._options.buildDir,
      BUILD_SERVER_DIR,
      manifest.chunks[name]
    );
  }

  private _requireDefault(modulePath: string) {
    const mod = require(modulePath);
    return mod.default || mod;
  }

  private _getServerManifest(): Manifest {
    return this._getManifest(BUILD_SERVER_DIR);
  }

  private _getClientManifest(): Manifest {
    return this._getManifest(BUILD_CLIENT_DIR);
  }

  private _getManifest(dir: string): Manifest {
    return require(path.join(this._options.buildDir, dir, BUILD_MANIFEST_PATH));
  }
}
