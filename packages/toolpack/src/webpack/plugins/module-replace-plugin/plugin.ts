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
  replacedModule: string;
  compilers: Set<Compiler>;
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
  ORIGINAL: 2,
} as const;

interface Handler {
  resolve(): void;
  finish: Map<Compiler, boolean>;
}

const knownModules = new Map<string, ModuleInfo>();
const moduleHandlers = new Map<string, Handler>();

export default class ModuleReplacePlugin implements Plugin {
  private _options: ModuleReplacePluginOptions;

  static restoreModule(id: string): false | Promise<any> {
    const moduleInfo = knownModules.get(id);
    if (!moduleInfo) {
      return false;
    }

    moduleInfo.status = ModuleStatus.ORIGINAL;
    const handler: Handler = {
      resolve: null as any,
      finish: new Map(),
    };
    moduleHandlers.set(id, handler);
    const promise = new Promise((resolve) => {
      handler.resolve = resolve;
    });
    moduleInfo.compilers.forEach((compiler) => {
      handler.finish.set(compiler, false);
      compiler.hooks.invalid.call('noop', new Date());
    });

    return promise;
  }

  constructor(options: Partial<ModuleReplacePluginOptions>) {
    this._options = {
      modules: [],
      ...options,
    };
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap('done', () => {
      const finished: string[] = [];
      for (const [id, handler] of moduleHandlers) {
        if (handler.finish.get(compiler)) {
          handler.finish.delete(compiler);
        }

        if (handler.finish.size <= 0) {
          handler.resolve();
          finished.push(id);
        }
      }

      for (const id of finished) {
        knownModules.delete(id);
        moduleHandlers.delete(id);
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

    compiler.hooks.compilation.tap('ModuleReplacePlugin', (compilation) => {
      compilation.hooks.buildModule.tap('ModuleReplacePlugin', (wpModule) =>
        this._handleBuildModule(compiler, wpModule)
      );
    });
  }

  private _handleBuildModule(compiler: Compiler, wpModule: any) {
    // const filename = wpModule.resource
    //   ? wpModule.resource.replace(/\?.*$/, "")
    //   : "";
    // if (
    //   filename === "/Users/lixi/Workspace/github/shuvi-test/src/pages/index.js"
    // ) {
    //   console.log("handleBuildModule", wpModule)
    // }

    const id = getModuleId(wpModule);
    const moduleInfo = knownModules.get(id);
    if (!moduleInfo) {
      return;
    }

    if (moduleInfo.status === ModuleStatus.ORIGINAL) {
      const handler = moduleHandlers.get(id)!;
      handler.finish.set(compiler, true);
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
              module: moduleInfo.replacedModule,
            },
          },
        ];
        wpModule.loaders[REPLACED] = true;
      }
    }
  }

  private _collectModules(compiler: Compiler, wpModule: any) {
    const id = getModuleId(wpModule);
    const moduleInfo = knownModules.get(id);
    if (moduleInfo) {
      moduleInfo.compilers.add(compiler);
      return;
    }

    const replacedModule = this._getReplacedModule(wpModule);
    if (replacedModule) {
      knownModules.set(id, {
        status: ModuleStatus.REPLACED,
        replacedModule,
        compilers: new Set([compiler]),
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
        shouldReplace = test(request, wpModule);
      }

      if (shouldReplace) return module;
    }

    return null;
  }
}
