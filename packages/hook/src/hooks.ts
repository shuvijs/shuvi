// 钩子参数来源（void，固定值，前一个钩子的返回值） 钩子同步异步 钩子调用顺序（） 钩子返回值
// 普通型钩子handler均无返回值（如果有，则是一个数组，但是似乎没啥用，如果对返回值有要求，那么应该用waterfall钩子）

// waterfall 类肯定是顺序执行，参数和返回值必须相同
// modernjs模型中的workflow看起来比较鸡肋

// 问题 现在any会被当成void
// 正常变量 extends void 左右 都是 never
// 所以突破点是区分 void 和 any

export type HookRunnerFromHandler<T> = T extends (...args: infer A) => infer R
  ? void extends R
    ? (...args: A) => void
    : (...args: A) => R[]
  : T;
export type RemoveVoidParameter<T> = T extends (
  initalValue: infer I,
  extraArg: infer E
) => infer R
  ? null extends I
    ? /*('I is any') :*/
      null extends E
      ? (initialValue: I, extraArg: E) => R
      : void extends E
      ? (initialValue: I) => R
      : (initialValue: I, extraArg: E) => R
    : void extends I
    ? null extends E
      ? (extraArg: E) => R
      : void extends E
      ? () => R
      : (extraArg: E) => R
    : null extends E
    ? (initialValue: I, extraArg: E) => R
    : void extends E
    ? (initialValue: I) => R
    : (initialValue: I, extraArg: E) => R
  : T;

export type RemoveVoidParameterBackup<T> = T extends (
  initalValue: infer I,
  extraArg: infer E
) => infer R
  ? I extends void
    ? I extends void
      ? E extends void
        ? E extends void
          ? (/*'I无 E无'*/) => R
          : (extraArg: E) => R
        : (extraArg: E) => R
      : E extends void
      ? E extends void
        ? (/*'I无 E无'*/) => R
        : (initalValue: I, extraArg: E) => R
      : (initalValue: I, extraArg: E) => R
    : E extends void
    ? E extends void
      ? (initalValue: I) => R
      : (initalValue: I, extradddArg: E) => R
    : (initalValue: I, extraArg: E) => R
  : T;

export type Remove3VoidParameter<T> = T extends (
  initalValue: infer I,
  extraArg: infer E,
  context: infer C
) => infer R
  ? I extends void
    ? I extends void
      ? E extends void
        ? E extends void
          ? C extends void
            ? C extends void
              ? 'C无'
              : 'C为any'
            : 'C有' /*'I无 E无'*/
          : (extraArg: E) => R /*I无 E为any*/
        : (extraArg: E) => R
      : E extends void
      ? E extends void
        ? (/*'I无 E无'*/) => R
        : (initalValue: I, extraArg: E) => R
      : (initalValue: I, extraArg: E) => R
    : /* (E extends void ?
      (E extends void ? ((initalValue: I) => R) : ((initalValue: I, extradddArg: E) => R)) :
      ((initalValue: I, extraArg: E) => R)
    ) */
      'I有'
  : T;

export type SyncHookHandler<I, E, R> = (initalValue: I, extraArg: E) => R;
export type SyncBailHookHandler<I, E, R> = (
  initalValue: I,
  extraArg: E
) => R | undefined | void;
export type SyncWaterfallHookHandler<I, E> = (
  initalValue: I,
  extraArgs: E
) => I;
export type AsyncSeriesWaterfallHookHandler<I, E> = (
  initalValue: I,
  extraArg: E
) => Promise<I> | I;
export type AsyncParallelHookHandler<I, E, R> = (
  initalValue: I,
  extraArgs: E
) => Promise<R> | R;

/** Normal hook. */
export type SyncHook<I = void, E = void, R = void> = {
  use: (...handlers: RemoveVoidParameter<SyncHookHandler<I, E, R>>[]) => void;
  run: RemoveVoidParameter<(initalValue: I, extraArg: E) => R[]>;
  clear: () => void;
  type: string;
};

/** Has return value with `any` type */
export type SyncBailHook<I = void, E = void, R = I> = {
  use: (
    ...handlers: RemoveVoidParameter<SyncBailHookHandler<I, E, R>>[]
  ) => void;
  run: RemoveVoidParameter<SyncBailHookHandler<I, E, R>>;
  clear: () => void;
  type: string;
};

/** Has return value with given type */
export type SyncWaterfallHook<I, E = void> = {
  use: (
    ...handlers: RemoveVoidParameter<SyncWaterfallHookHandler<I, E>>[]
  ) => void;
  run: RemoveVoidParameter<SyncWaterfallHookHandler<I, E>>;
  clear: () => void;
  type: string;
};

/** Normal async hook. No return value
 *
 * RemoveVoidParameter<(
    null extends R ?
    (R extends void ? ((initalValue: I, extraArg: E) => Promise<R[]>) :
      ((initalValue: I, extraArg: E) => Promise<R[]>)) :
    ((initalValue: I, extraArg: E) => Promise<R[]>)
  )>
 */
export type AsyncParallelHook<I = void, E = void, R = void> = {
  use: (
    ...handlers: RemoveVoidParameter<AsyncParallelHookHandler<I, E, R>>[]
  ) => void;
  run: RemoveVoidParameter<(initalValue: I, extraArg: E) => Promise<R[]>>;
  clear: () => void;
  type: string;
};

/** Has return value with given type */
export type AsyncSeriesWaterfallHook<I = void, E = void> = {
  use: (
    ...handlers: RemoveVoidParameter<AsyncSeriesWaterfallHookHandler<I, E>>[]
  ) => void;
  run: RemoveVoidParameter<(initalValue: I, extraArgs: E) => Promise<I>>;
  clear: () => void;
  type: string;
};

export const createSyncHook = <I = void, E = void, R = void>(): SyncHook<
  I,
  E,
  R
> => {
  let _handlers: RemoveVoidParameter<SyncHookHandler<I, E, R>>[] = [];
  const use = (
    ...handlers: RemoveVoidParameter<SyncHookHandler<I, E, R>>[]
  ) => {
    _handlers.push(...handlers);
  };
  const run = (...args: any[]) => {
    // @ts-ignore
    return _handlers.map(handler => handler(...args));
  };
  const clear = () => {
    _handlers = [];
  };
  return {
    use,
    run,
    clear,
    type: 'SyncHook'
  };
};

export const createSyncBailHook = <I = void, E = void, R = I>(): SyncBailHook<
  I,
  E,
  R
> => {
  let _handlers: RemoveVoidParameter<SyncBailHookHandler<I, E, R>>[] = [];
  const use = (
    ...handlers: RemoveVoidParameter<SyncBailHookHandler<I, E, R>>[]
  ) => {
    _handlers.push(...handlers);
  };
  const run = (...args: any[]) => {
    for (let i = 0; i < _handlers.length; i++) {
      const handler = _handlers[i];
      // @ts-ignore
      const result = handler(...args);
      if (result) return result;
    }
    return undefined;
  };
  const clear = () => {
    _handlers = [];
  };
  return {
    use,
    run,
    clear,
    type: 'SyncBailHook'
  };
};

export const createSyncWaterfallHook = <
  I = void,
  E = void
>(): SyncWaterfallHook<I, E> => {
  let _handlers: RemoveVoidParameter<SyncWaterfallHookHandler<I, E>>[] = [];
  const use = (
    ...handlers: RemoveVoidParameter<SyncWaterfallHookHandler<I, E>>[]
  ) => {
    _handlers.push(...handlers);
  };
  const run = (...args: any[]): I => {
    let [currentParam, ...otherArgs] = args;
    for (let i = 0; i < _handlers.length; i++) {
      const handler = _handlers[i];
      // @ts-ignore
      currentParam = handler(currentParam, ...otherArgs);
    }
    return currentParam;
  };
  const clear = () => {
    _handlers = [];
  };
  return {
    use,
    run,
    clear,
    type: 'SyncWaterfallHook'
  };
};

export const createAsyncParallelHook = <
  I = void,
  E = void,
  R = void
>(): AsyncParallelHook<I, E, R> => {
  let _handlers: RemoveVoidParameter<AsyncParallelHookHandler<I, E, R>>[] = [];
  const use = (
    ...handlers: RemoveVoidParameter<AsyncParallelHookHandler<I, E, R>>[]
  ) => {
    _handlers.push(...handlers);
  };
  const run = async (...args: any[]) =>
    await Promise.all(
      _handlers.map(
        // @ts-ignore
        handler => handler(...args)
      )
    );
  const clear = () => {
    _handlers = [];
  };
  return {
    use,
    run,
    clear,
    type: 'AsyncParallelHook'
  };
};

export const createAsyncSeriesWaterfallHook = <
  I = void,
  E = void
>(): AsyncSeriesWaterfallHook<I, E> => {
  let _handlers: RemoveVoidParameter<AsyncSeriesWaterfallHookHandler<I, E>>[] =
    [];
  const use = (
    ...handlers: RemoveVoidParameter<AsyncSeriesWaterfallHookHandler<I, E>>[]
  ) => {
    _handlers.push(...handlers);
  };
  const run = async (...args: any[]): Promise<I> => {
    let [currentParam, ...otherArgs] = args;
    for (let i = 0; i < _handlers.length; i++) {
      const handler = _handlers[i];
      // @ts-ignore
      currentParam = await handler(currentParam, ...otherArgs);
    }
    return currentParam;
  };
  const clear = () => {
    _handlers = [];
  };
  return {
    use,
    run,
    clear,
    type: 'AsyncSeriesWaterfallHook'
  };
};
