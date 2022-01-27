import {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  AsyncParallelHook,
  AsyncSeriesWaterfallHook,
  SyncHookHandler,
  SyncBailHookHandler,
  SyncWaterfallHookHandler,
  AsyncParallelHookHandler,
  AsyncSeriesWaterfallHookHandler,
  createSyncHook
} from './hooks';

type PatchPluginParameter<T, C> = RemoveVoidParameter<
  AddContextParameter<T, C>
>;

type AddContextParameter<T, C> = T extends (
  initalValue: infer I,
  extraArg: infer E
) => infer R
  ? (initalValue: I, extraArg: E, context: C) => R
  : T;

export type AnyHook =
  | SyncHook<any, any, any>
  | SyncBailHook<any, any, any>
  | SyncWaterfallHook<any, any>
  | AsyncParallelHook<any, any, any>
  | AsyncSeriesWaterfallHook<any, any>;
export interface HookMap {
  [x: string]: AnyHook;
}

export type Setup<EHM> = (utils: { addHooks: (hook: Partial<EHM>) => void }) => void

// 这意味着context需要在一开始就确定
export type HookManager<HM extends HookMap, C, EHM extends HookMap> = {
  createPlugin: (
    pluginHandlers: IPluginHandlers<HM & EHM, C> & {
      setup?: Setup<EHM>
    },
    options?: PluginOptions
  ) => IPlugin<HM & EHM, C>;
  usePlugin: (...plugins: IPlugin<HM & EHM, C>[]) => void;
  runner: RunnerType<HM, EHM>;
  setContext: (context: C) => void;
  clear: () => void;
  addHooks: (hook: Partial<EHM>) => void;
  hooks: HM | (HM & EHM);
};

type RunnerType<HM, EHM> = {
  [K in keyof (HM & EHM)]: HookRunnerType<(HM & EHM)[K]>;
} & { setup: Setup<EHM> }

type HookRunnerType<H> = H extends SyncHook<infer T, infer E, infer R>
  ? SyncHook<T, E, R>['run']
  : H extends SyncBailHook<infer T, infer E, infer R>
  ? SyncBailHook<T, E, R>['run']
  : H extends SyncWaterfallHook<infer T, infer E>
  ? SyncWaterfallHook<T, E>['run']
  : H extends AsyncParallelHook<infer T, infer E, infer R>
  ? AsyncParallelHook<T, E, R>['run']
  : H extends AsyncSeriesWaterfallHook<infer T, infer E>
  ? AsyncSeriesWaterfallHook<T, E>['run']
  : never;

type IPlugin<HM, C> = {
  handlers: IPluginHandlers<HM, C>;
  SYNC_PLUGIN_SYMBOL: 'SYNC_PLUGIN_SYMBOL';
} & PluginOptions;

type IPluginHandlers<HM, C> = Partial<IPluginHandlersFullMap<HM, C>>;

type IPluginHandlersFullMap<HM, C> = {
  [K in keyof HM]: HM[K] extends SyncHook<infer T, infer E, infer R>
    ? PatchPluginParameter<SyncHookHandler<T, E, R>, C>
    : HM[K] extends SyncBailHook<infer T, infer E, infer R>
    ? PatchPluginParameter<SyncBailHookHandler<T, E, R>, C>
    : HM[K] extends SyncWaterfallHook<infer T, infer E>
    ? PatchPluginParameter<SyncWaterfallHookHandler<T, E>, C>
    : HM[K] extends AsyncParallelHook<infer T, infer E, infer R>
    ? PatchPluginParameter<AsyncParallelHookHandler<T, E, R>, C>
    : HM[K] extends AsyncSeriesWaterfallHook<infer T, infer E>
    ? PatchPluginParameter<AsyncSeriesWaterfallHookHandler<T, E>, C>
    : never;
};

export type PluginOptions = {
  name?: string;
  pre?: string[];
  post?: string[];
  rivals?: string[];
  required?: string[];
  order?: number;
  [x: string]: any;
};

export const DEFAULT_OPTIONS: Required<PluginOptions> = {
  name: 'untitled',
  pre: [],
  post: [],
  rivals: [],
  required: [],
  order: 0
};

const SYNC_PLUGIN_SYMBOL = 'SYNC_PLUGIN_SYMBOL';

export const isPluginInstance = (plugin: any) =>
  plugin &&
  plugin.hasOwnProperty(SYNC_PLUGIN_SYMBOL) &&
  plugin.SYNC_PLUGIN_SYMBOL === SYNC_PLUGIN_SYMBOL;

const sortPlugins = <T extends IPlugin<any, any>[]>(input: T): T => {
  let plugins: T = input.slice() as T;
  plugins.sort((a, b) => (a.order as number) - (b.order as number));
  for (let i = 0; i < plugins.length; i++) {
    let plugin = plugins[i];
    if (plugin.pre) {
      for (const pre of plugin.pre) {
        for (let j = i + 1; j < plugins.length; j++) {
          if (plugins[j].name === pre) {
            plugins = [
              ...plugins.slice(0, i),
              plugins[j],
              ...plugins.slice(i, j),
              ...plugins.slice(j + 1, plugins.length)
            ] as T;
          }
        }
      }
    }

    if (plugin.post) {
      for (const post of plugin.post) {
        for (let j = 0; j < i; j++) {
          if (plugins[j].name === post) {
            plugins = [
              ...plugins.slice(0, j),
              ...plugins.slice(j + 1, i + 1),
              plugins[j],
              ...plugins.slice(i + 1, plugins.length)
            ] as T;
          }
        }
      }
    }
  }
  return plugins;
};

const checkPlugins = (plugins: IPlugin<any, any>[]) => {
  for (const origin of plugins) {
    if (origin.rivals) {
      for (const rival of origin.rivals) {
        for (const plugin of plugins) {
          if (rival === plugin.name) {
            throw new Error(`${origin.name} has rival ${plugin.name}`);
          }
        }
      }
    }
    if (origin.required) {
      for (const required of origin.required) {
        if (!plugins.some(plugin => plugin.name === required)) {
          throw new Error(
            `The plugin: ${required} is required when plugin: ${origin.name} is exist.`
          );
        }
      }
    }
  }
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type ArrayElements<T extends {}> = {
  [K in keyof T]: T[K][]
}

export const createHookManager = <
  HM extends HookMap,
  C = void,
  EHM extends HookMap = {}
>(
  hookMap: HM,
  hasContext: boolean = true
): HookManager<HM, C, EHM> => {
  const setupHook = createSyncHook<void, Setup<EHM>>()
  const _hookMap: HM | (HM & EHM) = { ...hookMap, setup: setupHook };
  let _plugins: IPlugin<HM & EHM, C>[] = [];
  let _hookHandlers: ArrayElements<IPluginHandlers<HM & EHM, C>> = {} as ArrayElements<IPluginHandlers<HM & EHM, C>>
  let _internalRunners: RunnerType<HM, EHM> = {} as RunnerType<HM, EHM>
  let _context: C;
  let _initiated = false
  const init = () => {
    load()
    const setupRunner = getRunner('setup')
    setupRunner({ addHooks })
  }
  const createPlugin = (
    pluginHandlers: IPluginHandlers<HM & EHM, C>,
    options: PluginOptions = {}
  ): IPlugin<HM & EHM, C> => {
    return {
      ...DEFAULT_OPTIONS,
      name: `plugin-id-${uuid()}`,
      ...options,
      handlers: pluginHandlers,
      SYNC_PLUGIN_SYMBOL
    };
  };
  const usePlugin = (...plugins: IPlugin<HM & EHM, C>[]) => {
    if (_initiated) {
      return;
    }
    _plugins.push(...plugins);
  };
  const load = () => {
    let plugins = _plugins;
    plugins = sortPlugins(plugins);
    checkPlugins(plugins);
    plugins.forEach(plugin => {
      const handlers = plugin.handlers;
      let hookName: keyof HM;
      for (hookName in handlers) {
        if (!_hookHandlers[hookName]) {
          _hookHandlers[hookName] = []
        }
        _hookHandlers[hookName].push(handlers[hookName])
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
    _plugins = []
    _hookHandlers = {} as ArrayElements<IPluginHandlers<HM & EHM, C>>
    _internalRunners = {} as RunnerType<HM, EHM>
    _initiated = false;
  };

  const addHooks = (extraHookMap: Partial<EHM>) => {
    for (const hookName in extraHookMap) {
      // connot override existed hooks
      if (!_hookMap[hookName]) {
        //@ts-ignore
        _hookMap[hookName] = extraHookMap[hookName]
        if (_internalRunners[hookName]) {
          delete _internalRunners[hookName]
        }
      }
    }
  }

  const getRunner = (hookName: keyof (HM & EHM)) => {
    if (_internalRunners[hookName]) {
      return _internalRunners[hookName]
    }
    const currentRunner = getSingerRunner(hookName)
    _internalRunners[hookName] = currentRunner as any
    return currentRunner
  }
  const getSingerRunner = (hookName: keyof (HM & EHM)) => {
    let used = false
    const hook = _hookMap[hookName] as AnyHook
    const handlers = _hookHandlers[hookName] || []
    if (!hook) return () => {}
    const isSetupHook = hookName === 'setup'
    if (isSetupHook) {
      return (util: any) => {
        let setupDone = false
        if (!used) {
          hook.use(...handlers as any[])
          // every time setup hook runs, set setupDone to true at the end
          // to make sure util methods cannot be used outside of the hook
          hook.use(() => { setupDone = true })
          used = true
        }
        const getDisposableFunctionProxy = (func: Function) => new Proxy(func, {
          apply(target, thisArg, argArray) {
            if (setupDone) {
              return
            }
            return target.apply(thisArg, argArray);
          }
        })
        const wrappedUtil = { ...util }
        for (let key in wrappedUtil) {
          if (typeof wrappedUtil[key] === 'function') {
            wrappedUtil[key] = getDisposableFunctionProxy(wrappedUtil[key])
          }
        }
        // @ts-ignore
        return hook.run(wrappedUtil)
      }
    }
    return (...args: any[]) => {
      if (!used) {
        hook.use(...handlers as any[])
        used = true
      }
      if (hasContext && !_context) {
        throw new Error(`Context not set. Hook ${hookName} running failed.`)
      }
      // @ts-ignore
      return hook.run(...args, _context);
    }
  }



  const runnerProxy = new Proxy({}, {
    get(_, prop) {
      if (!_initiated) {
        init()
        _initiated = true;
      }
      return getRunner(prop as keyof (HM & EHM))
    }
  }) as RunnerType<HM, EHM>

  return {
    createPlugin,
    usePlugin,
    runner: runnerProxy,
    clear,
    addHooks,
    hooks,
    setContext
  };
};
type RemoveVoidParameter<T> = T extends (
  initalValue: infer I,
  extraArg: infer E,
  context: infer C
) => infer R
  ? null extends I
    ? /*('I is any') :*/
      null extends E
      ? /* E is any */
        null extends C
        ? /* C is any */
          (initialValue: I, extraArg: E, context: C) => R
        : void extends C
        ? /*C is void*/
          (initialValue: I, extraArg: E) => R
        : /*C is normal*/
          (initialValue: I, extraArg: E, context: C) => R
      : void extends E
      ? /*E is void*/
        null extends C
        ? /* C is any */
          (initialValue: I, context: C) => R
        : void extends C
        ? /*C is void*/
          (initialValue: I) => R
        : /*C is normal*/
          (initialValue: I, context: C) => R
      : /*E is normal*/
      null extends C
      ? /* C is any */
        (initialValue: I, extraArg: E, context: C) => R
      : void extends C
      ? /*C is void*/
        (initialValue: I, extraArg: E) => R
      : /*C is normal*/
        (initialValue: I, extraArg: E, context: C) => R
    : void extends I
    ? /* I is void */
      null extends E
      ? /* E is any */
        null extends C
        ? /* C is any */
          (extraArg: E, context: C) => R
        : void extends C
        ? /*C is void*/
          (extraArg: E) => R
        : /*C is normal*/
          (extraArg: E, context: C) => R
      : void extends E
      ? /*E is void*/
        null extends C
        ? /* C is any */
          (context: C) => R
        : void extends C
        ? /*C is void*/
          () => R
        : /*C is normal*/
          (context: C) => R
      : /*E is normal*/
      null extends C
      ? /* C is any */
        (extraArg: E, context: C) => R
      : void extends C
      ? /*C is void*/
        (extraArg: E) => R
      : /*C is normal*/
        (extraArg: E, context: C) => R
    : null extends E
    ? /* E is any */
      null extends C
      ? /* C is any */
        (initialValue: I, extraArg: E, context: C) => R
      : void extends C
      ? /*C is void*/
        (initialValue: I, extraArg: E) => R
      : /*C is normal*/
        (initialValue: I, extraArg: E, context: C) => R
    : void extends E
    ? /*E is void*/
      null extends C
      ? /* C is any */
        (initialValue: I, context: C) => R
      : void extends C
      ? /*C is void*/
        (initialValue: I) => R
      : /*C is normal*/
        (initialValue: I, context: C) => R
    : /*E is normal*/
    null extends C
    ? /* C is any */
      (initialValue: I, extraArg: E, context: C) => R
    : void extends C
    ? /*C is void*/
      (initialValue: I, extraArg: E) => R
    : /*C is normal*/
      (initialValue: I, extraArg: E, context: C) => R
  : T;
