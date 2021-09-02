import { getFileManager, FileManager, FileOptions } from './file-manager';
import { getFilePresets } from './file-presets';
import { exportsFromObject } from './file-snippets';

import {
  ProjectContext,
  createProjectContext,
  UserModule,
  TargetModule
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

  setRoutesContent(content: string): void {
    this._projectContext.routesContent = content;
  }

  setApiRoutesContent(content: string): void {
    this._projectContext.apiRoutesContent = content;
  }

  setRuntimeConfigContent(content: string | null) {
    this._projectContext.runtimeConfigContent = content;
  }

  addEntryCode(content: string) {
    this._projectContext.entryCodes.push(content);
  }

  addEntryCodeToTop(content: string) {
    this._projectContext.entryCodes.unshift(content);
  }

  setEntryWrapperContent(content: string) {
    this._projectContext.entryWrapperContent = content;
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
    let key: keyof UserModule;
    for (key in userModule) {
      this._projectContext.userModule[key] = userModule[key] || '';
    }
  }
  setPlatformModule(module: string) {
    this._projectContext.platformModule = module;
  }
  setClientModule(module: TargetModule) {
    this._projectContext.clientModule = module;
  }
  setServerModule(module: TargetModule) {
    this._projectContext.serverModule = module;
  }

  addService(source: string, exported: string, filepath: string): void {
    const services = this._projectContext.services;
    const service = services.get(filepath);
    if (service) {
      const targetSource = service.get(source);
      if (targetSource) {
        targetSource.add(exported);
      } else {
        const exportedSet: Set<string> = new Set();
        exportedSet.add(exported);
        service.set(source, exportedSet);
      }
    } else {
      const exportedSet: Set<string> = new Set();
      exportedSet.add(exported);
      const service: Map<string, Set<string>> = new Map();
      service.set(source, exportedSet);
      services.set(filepath, service);
      this.addFile({
        name: filepath,
        content: (context: ProjectContext) => {
          const exportsConfig: { [key: string]: string[] } = {};
          const service = context.services.get(filepath);
          if (!service) {
            return null;
          }

          for (const [s, e] of service) {
            exportsConfig[s] = Array.from(e);
          }
          return exportsFromObject(exportsConfig);
        }
      });
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

export { ProjectBuilder, UserModule, TargetModule };
