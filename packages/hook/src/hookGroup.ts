import {
  createSyncHook,
  createSyncBailHook,
  createSyncWaterfallHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createAsyncSeriesBailHook,
  createAsyncSeriesHook
} from './hooks';
import { verifyPlugins, sortPlugins } from './utils';
import {
  AnyHook,
  CreatePlugin,
  IPluginHandlers,
  IPluginInstance,
  HookManager,
  HookMap,
  PluginOptions,
  RunnerType,
  Setup
} from './types';

const DEFAULT_OPTIONS: Required<PluginOptions> = {
  name: 'untitled',
  before: [],
  after: [],
  conflict: [],
  required: [],
  group: 0
};

const PLUGIN_SYMBOL = 'PLUGIN_SYMBOL';

export const isPluginInstance = <
  T extends IPluginInstance<any, any> = IPluginInstance<any, any>
>(
  plugin: any
): plugin is T =>
  plugin &&
  plugin.hasOwnProperty(PLUGIN_SYMBOL) &&
  plugin.PLUGIN_SYMBOL === PLUGIN_SYMBOL;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type ArrayElements<T extends {}> = {
  [K in keyof T]: T[K][];
};

const copyHookMap = <HM extends HookMap | Partial<HookMap>>(
  hookMap: HM
): HM => {
  const newHookMap: HookMap = {};
  for (const hookName in hookMap) {
    const hook = hookMap[hookName];
    switch (hook?.type) {
      case 'SyncHook':
        newHookMap[hookName] = createSyncHook();
        break;
      case 'SyncBailHook':
        newHookMap[hookName] = createSyncBailHook();
        break;
      case 'SyncWaterfallHook':
        newHookMap[hookName] = createSyncWaterfallHook();
        break;
      case 'AsyncParallelHook':
        newHookMap[hookName] = createAsyncParallelHook();
        break;
      case 'AsyncSeriesHook':
        newHookMap[hookName] = createAsyncSeriesHook();
        break;
      case 'AsyncSeriesBailHook':
        newHookMap[hookName] = createAsyncSeriesBailHook();
        break;
      case 'AsyncSeriesWaterfallHook':
        newHookMap[hookName] = createAsyncSeriesWaterfallHook();
        break;
      default:
    }
  }
  return newHookMap as HM;
};

export function createPlugin<HM extends HookMap, C = void>(
  pluginHandlers: IPluginHandlers<HM, C>,
  options: PluginOptions = {}
): IPluginInstance<HM, C> {
  return {
    ...DEFAULT_OPTIONS,
    name: `plugin-id-${uuid()}`,
    ...options,
    handlers: pluginHandlers,
    PLUGIN_SYMBOL
  };
}

export const createHookManager = <HM extends HookMap, C = void>(
  hookMap: HM,
  hasContext: boolean = true
): HookManager<HM, C> => {
  const setupHook = createSyncHook<void, Setup>();
  const _hookMap: HM = {
    ...copyHookMap(hookMap),
    setup: setupHook
  };
  let _plugins: IPluginInstance<HM, C>[] = [];
  let _hookHandlers: ArrayElements<IPluginHandlers<HM, C>> =
    {} as ArrayElements<IPluginHandlers<HM, C>>;
  let _internalRunners: RunnerType<HM> = {} as RunnerType<HM>;
  let _context: C;
  let _initiated = false;
  const init = () => {
    load();
    const setupRunner = getRunner('setup');
    setupRunner({ addHooks });
  };

  const usePlugin = (...plugins: IPluginInstance<HM, C>[]) => {
    if (_initiated) {
      return;
    }
    _plugins.push(...plugins);
  };
  const load = () => {
    verifyPlugins(_plugins);
    _plugins = sortPlugins(_plugins);
    _plugins.forEach(plugin => {
      const handlers = plugin.handlers;
      let hookName: keyof HM;
      for (hookName in handlers) {
        if (!_hookHandlers[hookName]) {
          _hookHandlers[hookName] = [];
        }
        _hookHandlers[hookName].push(handlers[hookName]);
      }
    });
  };

  const setContext = (context: C) => {
    _context = context;
  };
  const hooks = _hookMap;
  const clear = () => {
    Object.values(_hookMap).forEach(cur => {
      cur.clear();
    });
    _plugins = [];
    _hookHandlers = {} as ArrayElements<IPluginHandlers<HM, C>>;
    _internalRunners = {} as RunnerType<HM>;
    _initiated = false;
  };

  const addHooks = <EHM extends HookMap>(extraHookMap: Partial<EHM>) => {
    const extraHookMapNew = copyHookMap(extraHookMap);
    for (const hookName in extraHookMapNew) {
      // connot override existed hooks
      if (!_hookMap[hookName]) {
        //@ts-ignore
        _hookMap[hookName] = extraHookMapNew[hookName];
        if (_internalRunners[hookName]) {
          delete _internalRunners[hookName];
        }
      } else {
        console.log('has been added', hookName);
      }
    }
  };

  const getRunner = (hookName: keyof HM) => {
    if (_internalRunners[hookName]) {
      return _internalRunners[hookName];
    }
    const currentRunner = getSingerRunner(hookName);
    _internalRunners[hookName] = currentRunner as any;
    return currentRunner;
  };
  const getSingerRunner = (hookName: keyof HM) => {
    let used = false;
    const hook = _hookMap[hookName] as AnyHook;
    const handlers = _hookHandlers[hookName] || [];
    if (!hook) return () => {};
    const isSetupHook = hookName === 'setup';
    if (isSetupHook) {
      return (util: any) => {
        let setupDone = false;
        if (!used) {
          hook.use(...(handlers as any[]));
          // every time setup hook runs, set setupDone to true at the end
          // to make sure util methods cannot be used outside of the hook
          hook.use(() => {
            setupDone = true;
          });
          used = true;
        }
        const getDisposableFunctionProxy = (func: Function) =>
          new Proxy(func, {
            apply(target, thisArg, argArray) {
              if (setupDone) {
                return;
              }
              return target.apply(thisArg, argArray);
            }
          });
        const wrappedUtil = { ...util };
        for (let key in wrappedUtil) {
          if (typeof wrappedUtil[key] === 'function') {
            wrappedUtil[key] = getDisposableFunctionProxy(wrappedUtil[key]);
          }
        }
        // @ts-ignore
        return hook.run(wrappedUtil);
      };
    }
    return (...args: any[]) => {
      if (!used) {
        hook.use(...(handlers as any[]));
        used = true;
      }
      if (hasContext && !_context) {
        throw new Error(
          `Context not set. Hook ${String(hookName)} running failed.`
        );
      }
      // @ts-ignore
      return hook.run(...args, _context);
    };
  };

  const runnerProxy = new Proxy(
    {},
    {
      get(_, prop) {
        if (!_initiated) {
          init();
          _initiated = true;
        }
        return getRunner(prop as keyof HM);
      }
    }
  ) as RunnerType<HM>;

  return {
    createPlugin: createPlugin as CreatePlugin<HM, C>,
    usePlugin,
    runner: runnerProxy,
    clear,
    addHooks,
    hooks,
    setContext,
    getPlugins: () => _plugins
  };
};
