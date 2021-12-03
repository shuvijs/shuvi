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
  AsyncSeriesWaterfallHookHandler
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

type AnyHook =
  | SyncHook<any, any, any>
  | SyncBailHook<any, any, any>
  | SyncWaterfallHook<any, any>
  | AsyncParallelHook<any, any, any>
  | AsyncSeriesWaterfallHook<any, any>;
type HookMap = {
  [x: string]: AnyHook;
};

// 这意味着context需要在一开始就确定
type hookGroup<HM extends HookMap, C = void> = {
  createPlugin: (
    pluginHandlers: IPluginHandlers<HM, C>,
    options?: PluginOptions
  ) => IPlugin<HM, C>;
  usePlugin: (...plugins: IPlugin<HM, C>[]) => void;
  runner: RunnerType<HM>;
  setContext: (context: C) => void;
  clear: () => void;
  hooks: HM;
};

type RunnerType<HM> = {
  [K in keyof HM]: HookRunnerType<HM[K]>;
};
type HookRunnerType<H> = H extends SyncHook<infer T, infer E, infer R>
  ? SyncHook<T, E, R>['run']
  : H extends SyncBailHook<infer T, infer E>
  ? SyncBailHook<T, E>['run']
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
  [x: string]: any;
};

export const DEFAULT_OPTIONS: Required<PluginOptions> = {
  name: 'untitled',
  pre: [],
  post: [],
  rivals: [],
  required: []
};

const SYNC_PLUGIN_SYMBOL = 'SYNC_PLUGIN_SYMBOL';

export const isPluginInstance = (plugin: any) =>
  plugin &&
  plugin.hasOwnProperty('SYNC_PLUGIN_SYMBOL') &&
  plugin.SYNC_PLUGIN_SYMBOL === SYNC_PLUGIN_SYMBOL;

const sortPlugins = <T extends IPlugin<any, any>[]>(input: T): T => {
  let plugins: T = input.slice() as T;

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

export const createHookGroup = <HM extends HookMap, C = void>(
  hookMap: HM,
  context?: C
): hookGroup<HM, C> => {
  const _hookMap: HM = hookMap;
  let _plugins: IPlugin<HM, C>[] = [];
  let _context: C;
  let _loaded = false;
  if (context) {
    _context = context;
  }
  let index = 0;
  const createPlugin = (
    pluginHandlers: IPluginHandlers<HM, C>,
    options: PluginOptions = {}
  ): IPlugin<HM, C> => {
    return {
      ...DEFAULT_OPTIONS,
      name: `No.${index++} plugin`,
      ...options,
      handlers: pluginHandlers,
      SYNC_PLUGIN_SYMBOL
    };
  };
  const usePlugin = (...plugins: IPlugin<HM, C>[]) => {
    if (_loaded) {
      return;
    }
    _plugins.push(...plugins);
  };
  const load = () => {
    const plugins = _plugins;
    sortPlugins(plugins);
    checkPlugins(plugins);
    plugins.forEach(plugin => {
      const handlers = plugin.handlers;
      let hookName: keyof HM;
      for (hookName in handlers) {
        _hookMap[hookName] && _hookMap[hookName].use(handlers[hookName] as any);
      }
    });
  };
  const setContext = (context: C) => {
    _context = context;
  };
  const hooks = _hookMap;
  const clear = () => {
    _plugins = [];
    Object.values(hookMap).forEach(cur => {
      cur.clear();
    });
    _loaded = false;
  };
  const runner: RunnerType<HM> = Object.entries(hookMap).reduce((acc, cur) => {
    const [hookName, hook] = cur;
    // @ts-ignore
    acc[hookName] = (...args: any[]) => {
      if (!_loaded) {
        load();
        _loaded = true;
      }
      // @ts-ignore
      return hook.run(...args, _context);
    };
    return acc;
  }, {} as RunnerType<HM>);

  return {
    createPlugin,
    usePlugin,
    runner,
    clear,
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
/* const sync = createSyncHook<void, any>()
const hookMap = { sync }
type Context = {
  a: number
  b: string
}
const group = createHookGroup<typeof hookMap, Context>({ sync })
const { runner, createPlugin } = group
createPlugin({
  sync: ()
}) */
