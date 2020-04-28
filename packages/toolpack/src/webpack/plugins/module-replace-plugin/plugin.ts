import { Compiler, Plugin } from 'webpack';

const REPLACED = Symbol('replaced');

export type ConfigItem = {
  test: Function | RegExp;
  module: string;
};

export interface ModuleReplacePluginOptions {
  modules: ConfigItem[];
}

export interface ModuleInfo {
  status: typeof ModuleStatus[keyof typeof ModuleStatus];
  compiler: Compiler;
  replacedModule: string;
  loaders?: { loader: string; options: Record<string, any> }[];
}

const toString = Object.prototype.toString;

function isRegExp(target: object): target is RegExp {
  return toString.call(target) === `[object RegExp]`;
}

function isFunction(target: object): target is Function {
  return toString.call(target) === `[object Function]`;
}

function getModuleId(wpModule: any) {
  return wpModule.rawRequest;
}

const stubLoader = require.resolve('./stub-loader');

const ModuleStatus = {
  REPLACED: 1,
  ORIGINAL: 2
} as const;

interface Handler {
  resolve(): void;
  pending: Map<Compiler, boolean>;
}

interface CompilerInfo {
  modules: Map<string, ModuleInfo>;
}

// const knownModules = new Map<string, ModuleInfo>();
const moduleHandler = new Map<string, Handler>();
const compilerInfo = new Map<Compiler, CompilerInfo>();

function getKnownModules(id: string): ModuleInfo[] {
  const res: ModuleInfo[] = [];
  for (const compiler of compilerInfo.values()) {
    const module = compiler.modules.get(id);
    if (module) {
      res.push(module);
    }
  }
  return res;
}

function deleteKnownModules(id: string) {
  for (const compiler of compilerInfo.values()) {
    compiler.modules.delete(id);
  }
}

export default class ModuleReplacePlugin implements Plugin {
  private _options: ModuleReplacePluginOptions;

  static restoreModule(id: string): false | Promise<any> {
    const moduleInfos = getKnownModules(id);
    if (moduleInfos.length < 1) {
      return false;
    }

    const handler: Handler = {
      resolve: null as any,
      pending: new Map()
    };
    moduleHandler.set(id, handler);
    moduleInfos.forEach(moduleInfo => {
      moduleInfo.status = ModuleStatus.ORIGINAL;
      handler.pending.set(moduleInfo.compiler, false);
      moduleInfo.compiler.hooks.invalid.call('noop', new Date());
    });
    return new Promise(resolve => {
      handler.resolve = resolve;
    });
  }

  constructor(options: Partial<ModuleReplacePluginOptions>) {
    this._options = {
      modules: [],
      ...options
    };
  }

  apply(compiler: Compiler) {
    // init compiler info
    compilerInfo.set(compiler, {
      modules: new Map()
    });

    compiler.hooks.done.tap('done', () => {
      const finished: string[] = [];
      for (const [id, handler] of moduleHandler) {
        if (handler.pending.get(compiler)) {
          handler.pending.delete(compiler);
        }

        if (handler.pending.size <= 0) {
          handler.resolve();
          finished.push(id);
        }
      }

      for (const id of finished) {
        deleteKnownModules(id);
        moduleHandler.delete(id);
      }
    });

    compiler.hooks.beforeCompile.tapAsync(
      'ModuleReplacePlugin',
      ({ normalModuleFactory }: any, callback) => {
        normalModuleFactory.hooks.afterResolve.tap(
          'ModuleReplacePlugin',
          (wpModule: any) => this._collectModules(compiler, wpModule)
        );
        callback();
      }
    );

    compiler.hooks.compilation.tap('ModuleReplacePlugin', compilation => {
      compilation.hooks.buildModule.tap('ModuleReplacePlugin', wpModule =>
        this._handleBuildModule(compiler, wpModule)
      );
    });
  }

  private _handleBuildModule(compiler: Compiler, wpModule: any) {
    const knownModules = compilerInfo.get(compiler)!.modules;
    const id = getModuleId(wpModule);
    const moduleInfo = knownModules.get(id);
    if (!moduleInfo) {
      return;
    }

    if (moduleInfo.status === ModuleStatus.ORIGINAL) {
      const handler = moduleHandler.get(id)!;
      handler.pending.set(compiler, true);
      wpModule.loaders = moduleInfo.loaders;
      return;
    }

    if (moduleInfo.status === ModuleStatus.REPLACED) {
      if (wpModule.loaders && wpModule.loaders[REPLACED] !== true) {
        moduleInfo.loaders = wpModule.loaders;
        wpModule.loaders = [
          {
            loader: stubLoader,
            options: {
              module: moduleInfo.replacedModule
            }
          }
        ];
        wpModule.loaders[REPLACED] = true;
      }
    }
  }

  private _collectModules(compiler: Compiler, wpModule: any) {
    const knownModules = compilerInfo.get(compiler)!.modules;
    const id = getModuleId(wpModule);
    if (knownModules.has(id)) {
      return;
    }

    const replacedModule = this._getReplacedModule(wpModule);
    if (replacedModule) {
      knownModules.set(id, {
        status: ModuleStatus.REPLACED,
        replacedModule,
        compiler
      });
    }
  }

  private _getReplacedModule(wpModule: any): string | null {
    const { request, dependencies } = wpModule;
    if (dependencies.length <= 0) return null;

    const { modules } = this._options;
    for (let index = 0; index < modules.length; index++) {
      const { test, module } = modules[index];
      let shouldReplace = false;
      if (isRegExp(test)) {
        shouldReplace = test.test(request);
      } else if (isFunction(test)) {
        shouldReplace = test(wpModule);
      }

      if (shouldReplace) return module;
    }

    return null;
  }
}
