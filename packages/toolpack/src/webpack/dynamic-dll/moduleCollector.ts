const NODE_MODULES = /node_modules/;

export interface ModuleInfo {
  libraryPath: string;
  version: string;
}

export interface ModuleCollectorOptions {
  include?: RegExp[];
  exclude?: RegExp[];
}

export interface ModuleSnapshot {
  [key: string]: ModuleInfo;
}

class ModuleCollector {
  private _include;
  private _exclude;
  private _modules: Record<string, ModuleInfo> = {};
  private _changed!: boolean;

  constructor(options: ModuleCollectorOptions) {
    this._include = options.include || [];
    this._exclude = options.exclude || [];
    this._changed = false;
  }

  shouldCollect({
    request,
    context,
    resource
  }: {
    request: string;
    context: string;
    resource: string;
  }): boolean {
    if (request.startsWith('.')) {
      return false;
    }

    // only inlucde modules that user has referenced in his src/
    if (NODE_MODULES.test(context)) {
      return false;
    }

    if (this._exclude.some(p => p.test(request))) {
      return false;
    }

    if (this._include.some(p => p.test(request))) {
      return true;
    }

    return NODE_MODULES.test(resource);
  }

  hasChanged() {
    return this._changed;
  }

  add(id: string, { libraryPath, version }: ModuleInfo) {
    const modules = this._modules;
    const mod = modules[id];
    if (!mod) {
      modules[id] = {
        libraryPath,
        version
      };
      this._changed = true;
    } else {
      const { version: oldVersion } = mod;
      if (oldVersion !== version) {
        modules[id] = {
          libraryPath,
          version
        };
        this._changed = true;
      }
    }
  }

  snapshot(): ModuleSnapshot {
    const snapshot = { ...this._modules };
    this._changed = false;
    return snapshot;
  }
}

export type { ModuleCollector };

export function getModuleCollector(options: ModuleCollectorOptions) {
  return new ModuleCollector({
    include: options.include,
    exclude: options.exclude
  });
}
