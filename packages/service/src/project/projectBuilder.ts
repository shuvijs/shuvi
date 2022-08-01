import * as path from 'path';
import invariant from '@shuvi/utils/lib/invariant';
import { getFilePresets } from './file-presets';
import { getExportsFromObject } from './file-utils';
import { RuntimePluginConfig } from '../core';
import { ProjectContext, createProjectContext } from './projectContext';
import {
  getFileBuilder,
  defineFile,
  FileBuilder,
  FileOption
} from './file-builder';

function checkFilepath(filepath: string): string {
  invariant(
    !path.isAbsolute(filepath),
    `Path must be a relative path without any "./" and "../". Received "${filepath}"`
  );

  const components = filepath.replace(/\\/g, '/').split('/');
  invariant(
    !components.some(x => x === '.' || x === '..'),
    `Path cannot contain "./" or "../". Received "${filepath}"`
  );

  return filepath;
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
  private _fileBuilder: FileBuilder<ProjectContext>;
  private _internalFiles: FileOption<any, any>[];

  constructor() {
    this._projectContext = createProjectContext();

    this._fileBuilder = getFileBuilder(this._projectContext);
    this._internalFiles = getFilePresets();
    this._internalFiles.forEach(file => {
      //this._fileManager.addFile(file);
      this._fileBuilder.addFile(file);
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
    filepath = path.join('app', 'runtime', checkFilepath(filepath));
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
      this.addFile(
        defineFile({
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
        })
      );
    }
  }

  addResources(key: string, requireStr?: string): void {
    const services = this._projectContext.resources;
    services.set(key, requireStr);
  }

  /**
   * default path is the root path
   */
  addFile(option: FileOption<any, any>): void {
    if (option.name) {
      checkFilepath(option.name);
    }
    //this._fileManager.addFile(options);
    this._fileBuilder.addFile(option);
  }

  async build(dir: string): Promise<void> {
    await this._fileBuilder.build(dir);
  }

  async watch(dir: string): Promise<void> {
    await this._fileBuilder.watch(dir);
  }

  async stopBuild(): Promise<void> {
    await this._fileBuilder.close();
  }

  getContentGetter() {
    return this._fileBuilder.getContent;
  }
}

export { ProjectBuilder };
