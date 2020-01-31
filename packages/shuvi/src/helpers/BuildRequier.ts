import path from "path";
import {
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_DOCUMENT,
  BUILD_SERVER_APP,
  BUILD_CLIENT_RUNTIME_MAIN
} from "../constants";

interface BuildRequireConstructionOptions {
  buildDir: string;
}

export default class BuildRequire {
  private _options: BuildRequireConstructionOptions;

  constructor(options: BuildRequireConstructionOptions) {
    this._options = options;
  }

  requireDocument(): any {
    return this._requireDefault(
      this._resolveServerModule(BUILD_SERVER_DOCUMENT)
    );
  }

  requireApp(): any {
    return this._requireDefault(this._resolveServerModule(BUILD_SERVER_APP));
  }

  getEntryAssets(name: string): string[] {
    const manifest = this._getClientManifest();
    return manifest.entries[name];
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

  private _getServerManifest() {
    return this._getManifest(BUILD_SERVER_DIR);
  }

  private _getClientManifest() {
    return this._getManifest(BUILD_CLIENT_DIR);
  }

  private _getManifest(dir: string) {
    return require(path.join(this._options.buildDir, dir, BUILD_MANIFEST_PATH));
  }
}
