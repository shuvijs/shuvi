import * as path from 'path';
import { getFileManager, FileManager, FileOptionsBase } from './file-manager';
import { getFilePresets } from './file-presets';
import { getExportsFromObject, getContentProxyObj } from './file-utils';
import { RuntimePluginConfig } from '../core';
import { ProjectContext, createProjectContext } from './projectContext';

interface ProjectBuilderOptions {
  static?: boolean;
}

const isTruthy = (value: unknown, recursive = true): boolean => {
  if (!value) return false;
  if (typeof value === 'string') {
    return Boolean(value);
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (value instanceof Map) {
    return value.size > 0;
  }
  if (typeof value === 'object') {
    if (recursive) {
      return Object.values(value as Record<string, unknown>).every(x =>
        isTruthy(x, false)
      );
    } else {
      return true;
    }
  }
  return Boolean(value);
};

class ProjectBuilder {
  private _projectContext: ProjectContext;
  private _fileManager: FileManager;
  private _internalFiles: FileOptionsBase[];

  constructor(option: ProjectBuilderOptions = {}) {
    this._projectContext = createProjectContext();
    this._fileManager = getFileManager({
      watch: !option.static,
      context: this._projectContext
    });
    this._internalFiles = getFilePresets();
    this._internalFiles.forEach((file: FileOptionsBase) => {
      this._fileManager.addFile(file);
    });
  }

  addRuntimePlugin(plugin: RuntimePluginConfig) {
    this._projectContext.runtimePlugins.push(plugin);
  }

  addTypeDeclarationFile(file: string) {
    this._projectContext.typeDeclarationFiles.push(file);
  }

  addRuntimeService(
    source: string,
    exported: string,
    filepath: string = 'index.ts'
  ): void {
    const services = this._projectContext.runtimeServices;
    filepath = path.join('runtime', path.resolve('/', filepath));
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
          const service = context.runtimeServices.get(filepath);
          if (!service) {
            return null;
          }

          for (const [s, e] of service) {
            exportsConfig[s] = Array.from(e);
          }
          return getExportsFromObject(exportsConfig);
        }
      });
    }
  }

  addResources(key: string, requireStr?: string): void {
    const services = this._projectContext.resources;
    const filepath = path.join('resources', path.resolve('/', 'index.js'));
    const service = services.get(filepath);
    if (service) {
      service.set(key, requireStr);
    } else {
      const service: Map<string, string | undefined> = new Map();
      service.set(key, requireStr);
      services.set(filepath, service);
      this.addFile({
        name: filepath,
        content: (context: ProjectContext) => {
          const proxyObj: { [key: string]: string | undefined } = {};
          const service = context.resources.get(filepath);
          if (!service) {
            return null;
          }
          for (const [k, r] of service) {
            proxyObj[k] = r;
          }
          return getContentProxyObj(proxyObj);
        }
      });
    }
  }

  /**
   * default path is the root path
   */
  addFile(options: FileOptionsBase): void {
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

  getContentGetter() {
    return this._fileManager.getContent;
  }
}

export { ProjectBuilder };
