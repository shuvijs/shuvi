import path from 'path';
import { getFileManager, FileManager, FileOptions } from './file-manager';
import { getFilePresets } from './file-presets';
import { exportsFromObject, getContentProxyObj } from './file-snippets';
import { IRuntimeOrServerPlugin } from '../core';
import {
  ProjectContext,
  createProjectContext,
  UserModule,
  TargetModule
} from './projectContext';

interface ProjectBuilderOptions {
  static?: boolean;
}

type KeyOfProjectBuilder = keyof ProjectBuilder;
type KeyRelativeMethod = KeyOfProjectBuilder | KeyOfProjectBuilder[];
interface ContextValidatingRule {
  ignore?: boolean;
  method: KeyRelativeMethod;
}

type ContextValidatingRuleMap = {
  [key in keyof ProjectContext]: KeyRelativeMethod | ContextValidatingRule;
};

const contextValidatingRuleMap: ContextValidatingRuleMap = {
  entryCodes: 'addEntryCode',
  routesContent: 'setRoutesContent',
  apiRoutesContent: 'setApiRoutesContent',
  middlewareRoutesContent: 'setMiddlewareRoutesContent',
  entryWrapperContent: 'setEntryWrapperContent',
  polyfills: {
    ignore: true,
    method: 'addPolyfill'
  },
  runtimeServices: {
    ignore: true,
    method: 'addRuntimeService'
  },
  resources: {
    ignore: true,
    method: 'addResources'
  },
  runtimePlugins: {
    ignore: true,
    method: 'addRuntimePlugin'
  },
  runtimeConfigContent: {
    ignore: true,
    method: 'setRuntimeConfigContent'
  },
  clientModule: 'setClientModule',
  platformModule: 'setPlatformModule',
  userModule: 'setUserModule'
};

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

  setMiddlewareRoutesContent(content: string): void {
    this._projectContext.middlewareRoutesContent = content;
  }

  setRuntimeConfigContent(content: string | null) {
    this._projectContext.runtimeConfigContent = content;
  }

  addEntryCode(content: string) {
    this._projectContext.entryCodes.push(content);
  }

  setEntryWrapperContent(content: string) {
    this._projectContext.entryWrapperContent = content;
  }

  addPolyfill(file: string) {
    if (!this._projectContext.polyfills.includes(file)) {
      this._projectContext.polyfills.push(file);
    }
  }

  addRuntimePlugin(...plugins: IRuntimeOrServerPlugin[]) {
    this._projectContext.runtimePlugins.push(...plugins);
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

  addRuntimeService(
    source: string,
    exported: string,
    filepath: string = 'index.js'
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
          return exportsFromObject(exportsConfig);
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
  /**
   * will throw an error if validate fails
   */
  validateCompleteness(caller: string): void {
    let key: keyof ProjectContext;
    for (key in contextValidatingRuleMap) {
      const rule = contextValidatingRuleMap[key];
      if (rule && (rule as ContextValidatingRule).ignore) {
        continue;
      }
      const contextValue = this._projectContext[key];
      if (!isTruthy(contextValue)) {
        const method =
          (rule as ContextValidatingRule).method || (rule as KeyRelativeMethod);
        const methods = Array.isArray(method) ? method : [method];
        const warningText = `Shuvi-app file completeness validation failed. ${key} not set. Please make sure that ${methods
          .map((x: string) => `${caller}.${x}`)
          .join(' or ')} has been called`;
        throw new Error(warningText);
      }
    }
  }
}

export { ProjectBuilder, UserModule, TargetModule };
