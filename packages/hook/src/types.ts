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
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesHookHandler,
  AsyncSeriesBailHookHandler
} from './hooks';

export type PatchPluginParameter<T, C> = RemoveManagerVoidParameter<
  AddContextParameter<T, C>
>;

export type AddContextParameter<T, C> = T extends (
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
  | AsyncSeriesHook<any, any, any>
  | AsyncSeriesBailHook<any, any, any>
  | AsyncSeriesWaterfallHook<any, any>;
export interface HookMap {
  [x: string]: AnyHook;
}

export type Setup<HM extends HookMap = {}> = (utils: {
  addHooks: (hook: Partial<HM>) => void;
}) => void;

export type CreatePlugin<HM extends HookMap, C> = (
  pluginHandlers: IPluginHandlers<HM, C> & {
    setup?: Setup;
  },
  options?: PluginOptions
) => IPluginInstance<HM, C>;

export type HookManager<HM extends HookMap, C> = {
  createPlugin: CreatePlugin<HM, C>;
  usePlugin: (...plugins: IPluginInstance<HM, C>[]) => void;
  runner: RunnerType<HM>;
  setContext: (context: C) => void;
  clear: () => void;
  addHooks: <EHM extends HookMap>(hook: Partial<EHM>) => void;
  hooks: HM;
  getPlugins: () => IPluginInstance<HM, C>[];
};

export type RunnerType<HM> = {
  [K in keyof HM]: HookRunnerType<HM[K]>;
} & { setup: Setup };

export type HookRunnerType<H> = H extends SyncHook<infer T, infer E, infer R>
  ? SyncHook<T, E, R>['run']
  : H extends SyncBailHook<infer T, infer E, infer R>
  ? SyncBailHook<T, E, R>['run']
  : H extends SyncWaterfallHook<infer T, infer E>
  ? SyncWaterfallHook<T, E>['run']
  : H extends AsyncParallelHook<infer T, infer E, infer R>
  ? AsyncParallelHook<T, E, R>['run']
  : H extends AsyncSeriesHook<infer T, infer E, infer R>
  ? AsyncSeriesHook<T, E, R>['run']
  : H extends AsyncSeriesBailHook<infer T, infer E, infer R>
  ? AsyncSeriesBailHook<T, E, R>['run']
  : H extends AsyncSeriesWaterfallHook<infer T, infer E>
  ? AsyncSeriesWaterfallHook<T, E>['run']
  : never;

export type IPluginInstance<HM, C> = {
  handlers: IPluginHandlers<HM, C>;
  PLUGIN_SYMBOL: 'PLUGIN_SYMBOL';
} & Required<PluginOptions>;

export type IPluginHandlers<HM, C> = Partial<IPluginHandlersFullMap<HM, C>>;

export type IPluginHandlersFullMap<HM, C> = {
  [K in keyof HM]: HM[K] extends SyncHook<infer T, infer E, infer R>
    ? PatchPluginParameter<SyncHookHandler<T, E, R>, C>
    : HM[K] extends SyncBailHook<infer T, infer E, infer R>
    ? PatchPluginParameter<SyncBailHookHandler<T, E, R>, C>
    : HM[K] extends SyncWaterfallHook<infer T, infer E>
    ? PatchPluginParameter<SyncWaterfallHookHandler<T, E>, C>
    : HM[K] extends AsyncParallelHook<infer T, infer E, infer R>
    ? PatchPluginParameter<AsyncParallelHookHandler<T, E, R>, C>
    : HM[K] extends AsyncSeriesHook<infer T, infer E, infer R>
    ? PatchPluginParameter<AsyncSeriesHookHandler<T, E, R>, C>
    : HM[K] extends AsyncSeriesBailHook<infer T, infer E, infer R>
    ? PatchPluginParameter<AsyncSeriesBailHookHandler<T, E, R>, C>
    : HM[K] extends AsyncSeriesWaterfallHook<infer T, infer E>
    ? PatchPluginParameter<AsyncSeriesWaterfallHookHandler<T, E>, C>
    : never;
};

export type PluginOptions = {
  name?: string;

  /** current plugin should before these configured plugins.
   * only works for same group
   */
  before?: string[];

  /** current plugin should after these configured plugins.
   * only works for same group.
   */
  after?: string[];

  /** current plugin should not be used with these configured plugins */
  conflict?: string[];

  /** current plugin should be used with these configured plugins */
  required?: string[];

  /** current plugin group.
   * smaller group will be executed first
   * 0: default
   */
  group?: number;
  [x: string]: any;
};

export type RemoveManagerVoidParameter<T> = T extends (
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
