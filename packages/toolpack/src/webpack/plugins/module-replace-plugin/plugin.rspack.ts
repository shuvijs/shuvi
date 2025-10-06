import * as Rspack from '../../webpack';
import sharedData from './dynamic-loader-options-hack';

/**
 * Rspack plugin interface
 */
interface RspackPlugin {
  apply(compiler: Rspack.Compiler): void;
}

export type ConfigItem = {
  resourceQuery: Function | RegExp;
  module: string;
};

export interface ModuleReplacePluginOptions {
  modules: ConfigItem[];
}

export interface Loader {
  loader: string;
  options: Record<string, any>;
}

export interface ModuleInfo {
  action: typeof ModuleAction[keyof typeof ModuleAction];
  compiler: Rspack.Compiler;
  replacedModule: string;
  loaders: Loader[];
}

const REPLACED = Symbol('replaced');

const stubLoader = require.resolve('./stub-loader.rspack');

const pitchLoader = stubLoader;

const toString = Object.prototype.toString;

function isRegExp(target: any): target is RegExp {
  return toString.call(target) === `[object RegExp]`;
}

function isFunction(target: any): target is Function {
  return toString.call(target) === `[object Function]`;
}

function getModuleId(wpModule: any) {
  return (
    wpModule.rawRequest ||
    wpModule?.createData?.rawRequest ||
    /* rspack support */
    wpModule.request
  );
}
/**
 * extract the path, query and fragment from the resource path
 *
 * @param resource - the resource path with query and fragment
 * @returns the path, query and fragment
 */
function extractResourceResolveData(resource: string) {
  const [pathWithQuery, fragment] = resource.split('#');
  const [path, query] = pathWithQuery.split('?');
  return {
    path,
    query: query ? `?${query}` : '',
    fragment
  };
}

function isPitcher(loader: Loader) {
  return loader.loader.startsWith(pitchLoader);
}

function findReplacedModule(
  configs: ConfigItem[],
  query: string
): string | null {
  for (let index = 0; index < configs.length; index++) {
    const { resourceQuery, module } = configs[index];
    let isMatch = false;
    if (isRegExp(resourceQuery)) {
      isMatch = resourceQuery.test(query);
    } else if (isFunction(resourceQuery)) {
      isMatch = resourceQuery(query);
    }

    if (isMatch) {
      return module;
    }
  }

  return null;
}

const ModuleAction = {
  REPLACE: 'replace',
  RESTORE: 'restore'
} as const;

interface Handler {
  resolve(value?: any): void;
  pending: Map<Rspack.Compiler, boolean>;
}

interface CompilerInfo {
  modules: Map<string, ModuleInfo>;
}

// const knownModules = new Map<string, ModuleInfo>();
const moduleHandler = new Map<string, Handler>();
const compilerInfo = new Map<Rspack.Compiler, CompilerInfo>();

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

// function forEachModule(id: string, cb: (mod: ModuleInfo) => void) {
//   for (const compiler of compilerInfo.values()) {
//     const mod = compiler.modules.get(id);
//     if (mod) {
//       cb(mod);
//     }
//   }
// }

export default class ModuleReplacePlugin implements RspackPlugin {
  private _options: ModuleReplacePluginOptions;

  static restoreModule(id: string): false | Promise<any> {
    const moduleInfos = getKnownModules(id).filter(
      m => m.action === ModuleAction.REPLACE
    );
    if (moduleInfos.length < 1) {
      return false;
    }

    const handler: Handler = {
      resolve: null as any,
      pending: new Map()
    };
    moduleHandler.set(id, handler);
    moduleInfos.forEach(moduleInfo => {
      moduleInfo.action = ModuleAction.RESTORE;
      handler.pending.set(moduleInfo.compiler, false);
    });
    return new Promise(resolve => {
      handler.resolve = resolve;
    });
  }

  static replaceModule(id: string): false | void {
    const moduleInfos = getKnownModules(id);

    if (moduleInfos.length < 1) {
      return false;
    }

    moduleInfos.forEach(moduleInfo => {
      moduleInfo.action = ModuleAction.REPLACE;
    });
  }

  constructor(options: Partial<ModuleReplacePluginOptions>) {
    this._options = {
      modules: [],
      ...options
    };
  }

  apply(compiler: Rspack.Compiler) {
    const { modules } = this._options;

    // init compiler info
    compilerInfo.set(compiler, {
      modules: new Map()
    });

    const pitcher = {
      resourceQuery(query: string) {
        const find = findReplacedModule(modules, query);
        return !!find;
      },
      use: [
        {
          loader: pitchLoader
        }
      ]
    };

    // replace original rules
    compiler.options.module.rules?.unshift(pitcher);

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
        moduleHandler.delete(id);
      }
    });

    compiler.hooks.beforeCompile.tapAsync(
      'ModuleReplacePlugin',
      ({ normalModuleFactory }, callback) => {
        normalModuleFactory.hooks.afterResolve.tap(
          'ModuleReplacePlugin',
          wpModule => {
            this._collectModules(compiler, wpModule);
          }
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

  private _handleBuildModule(compiler: Rspack.Compiler, wpModule: any) {
    const knownModules = compilerInfo.get(compiler)!.modules;
    const id = getModuleId(wpModule);
    if (!id) {
      return;
    }
    const moduleInfo = knownModules.get(id);
    if (!moduleInfo) {
      return;
    }

    if (moduleInfo.action === ModuleAction.RESTORE) {
      const handler = moduleHandler.get(id);
      if (handler) {
        handler.pending.set(compiler, true);
      }
      const pitcher = (wpModule.loaders || []).find(isPitcher);
      if (pitcher) {
        /**
         * rspack can't get the dynamic options from the loader, so we need to use the dynamicLoaderOptionsHack to get the options
         */
        pitcher.options = {};
        sharedData.setData(wpModule.resourceResolveData.path, {
          action: moduleInfo.action
        });
      }
      return;
    }

    if (moduleInfo.action === ModuleAction.REPLACE) {
      if (!wpModule.loaders || wpModule.loaders[REPLACED] !== true) {
        wpModule.loaders[REPLACED] = true;
        const pitcher = (wpModule.loaders || []).find(isPitcher);
        if (pitcher) {
          /**
           * rspack can't get the dynamic options from the loader, so we need to use the dynamicLoaderOptionsHack to get the options
           */
          pitcher.options = {
            replacedModule: moduleInfo.replacedModule
          };
          sharedData.setData(wpModule.resourceResolveData.path, {
            replacedModule: moduleInfo.replacedModule,
            action: moduleInfo.action
          });
        }
      }
    }
  }

  private _collectModules(compiler: Rspack.Compiler, wpModule: any) {
    const knownModules = compilerInfo.get(compiler)!.modules;
    const id = getModuleId(wpModule);

    const parsedResourceResolveData = extractResourceResolveData(
      wpModule.request
    );
    const query = parsedResourceResolveData.query;

    if (knownModules.has(id) || !id) {
      return;
    }

    const replacedModule = findReplacedModule(this._options.modules, query);
    if (replacedModule) {
      knownModules.set(id, {
        action: ModuleAction.REPLACE,
        replacedModule,
        compiler,
        loaders: []
      });
    }
  }
}
