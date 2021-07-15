import { getFileManager, FileManager, FileOptions } from '../file-manager';
import { getFilePresets } from './file-presets';

import {
  ProjectContext,
  createProjectContext,
  UserModule
} from './projectContext';

interface ProjectBuilderOptions {
  static?: boolean;
}

class ProjectBuilder {
  private _projectContext: ProjectContext;
  private _fileManager: FileManager;
  private _internalFiles: FileOptions[];

  constructor(option: ProjectBuilderOptions = {}) {
    this._projectContext = createProjectContext();
    this._fileManager = getFileManager({
      watch: !option.static,
      context: this._projectContext
    });
    this._internalFiles = getFilePresets();
    this._internalFiles.forEach((file: FileOptions) => {
      this._fileManager.addFile(file);
    });
  }

  setViewModule(module: string) {
    this._projectContext.viewModule = module;
  }

  setRoutesNormalizer(module: string) {
    this._projectContext.routesNormalizer = module;
  }

  setAppModule(module: string | string[]) {
    this._projectContext.appModule = module;
  }

  setPluginModule(module: string | string[]) {
    this._projectContext.pluginModule = module;
  }

  setRoutesContent(content: string): void {
    this._projectContext.routesContent = content;
  }

  setRuntimeConfigContent(content: string | null) {
    this._projectContext.runtimeConfigContent = content;
  }

  addEntryCode(content: string) {
    this._projectContext.entryCodes.push(content);
  }

  addExport(source: string, exported: string) {
    this._projectContext.exports.set(source, ([] as string[]).concat(exported));
  }

  addPolyfill(file: string) {
    if (!this._projectContext.polyfills.includes(file)) {
      this._projectContext.polyfills.push(file);
    }
  }

  addRuntimePlugin(name: string, runtimePlugin: string) {
    this._projectContext.runtimePlugins.set(name, runtimePlugin);
  }

  setUserModule(userModule: Partial<UserModule>) {
    let key: keyof UserModule
    for (key in userModule) {
      this._projectContext.userModule[key] = userModule[key] || '';
    }
  }

  addFile(options: FileOptions): void {
    this._fileManager.addFile(options);
  }

  /**
   * There is no longer `buildOnce` method.
   * Continuous building or static building will rely on `static` value of `ProjectBuilderOptions`
   */
  async build(dir: string): Promise<void> {
    await this._fileManager.mount(dir);
  }

  async stopBuild(): Promise<void> {
    await this._fileManager.unmount();
  }
}

export { ProjectBuilder, UserModule };
