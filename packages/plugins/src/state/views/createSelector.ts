import invariant from '@shuvi/utils/lib/invariant';
import { isObject } from '../utils';

type Selector<
  // The state can be anything
  State = any,
  // The result will be inferred
  Result = unknown,
  // There are either 0 params, or N params
  Params extends never | readonly any[] = any[]
  // If there are 0 params, type the function as just State in, Result out.
  // Otherwise, type it as State + Params in, Result out.
> = [Params] extends [never]
  ? (state: State) => Result
  : (state: State, ...params: Params) => Result;

/** An array of input selectors */
type SelectorArray = ReadonlyArray<Selector>;

/** A standard function returning true if two values are considered equal */
type EqualityFn = (a: any, b: any, i: number) => boolean;

/** Any function with arguments */
type UnknownFunction = (...args: any[]) => unknown;

function getDependencies(funcs: unknown[]) {
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  if (!dependencies.every(dep => typeof dep === 'function')) {
    const dependencyTypes = dependencies
      .map(dep =>
        typeof dep === 'function'
          ? `function ${dep.name || 'unnamed'}()`
          : typeof dep
      )
      .join(', ');

    invariant(
      false,
      `createSelector expects all input-selectors to be functions, but received the following types: [${dependencyTypes}]`
    );
  }

  return dependencies as SelectorArray;
}
type paramsFun<State extends Record<string, any> = {}> = (
  state: State,
  _otherArgs?: any
) => any;
type paramsOtherArgs<OtherArgs> = (
  _state: any,
  otherArgs?: OtherArgs
) => OtherArgs;
type resultF<State extends Record<string, any> = {}, OtherArgs = any> = (
  param1: ReturnType<paramsFun<State>>,
  param2: ReturnType<paramsFun<State>>,
  param3: ReturnType<paramsOtherArgs<OtherArgs>>
) => any;

function createSelectorCreator<
  /** Selectors will eventually accept some function to be memoized */
  F extends UnknownFunction,
  /** A memoizer such as defaultMemoize that accepts a function + some possible options */
  MemoizeFunction extends typeof defaultMemoize,
  /** The additional options arguments to the memoizer */
  MemoizeOptions extends Parameters<MemoizeFunction>[1]
>(memoize: MemoizeFunction) {
  const createSelector = <
    State extends Record<string, any> = {},
    OtherArgs = any
  >(
    param1: paramsFun<State>,
    param2: paramsFun<State>,
    otherArgs: paramsOtherArgs<OtherArgs>,
    resultFunc: resultF<State, OtherArgs>,
    memoizeOption: { equalityCheck: EqualityFn }
  ) => {
    invariant(
      isObject(memoizeOption),
      `createSelector expects an object last inputs, but received: [${typeof memoizeOption}]`
    );

    invariant(
      typeof resultFunc === 'function',
      `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`
    );

    const { equalityCheck } = memoizeOption;

    const dependencies = getDependencies([param1, param2, otherArgs]);

    const memoizedResultFunc = memoize(
      function () {
        // apply arguments instead of spreading for performance.
        return resultFunc.apply(null, arguments as any);
      } as F,
      equalityCheck
    );

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    const selector = memoize(
      function (state: State, args: OtherArgs) {
        const params = [];
        const length = dependencies.length;

        for (let i = 0; i < length; i++) {
          // apply arguments instead of spreading and mutate a local list of params for performance.
          params.push(dependencies[i].call(null, state, args));
        }

        // apply arguments instead of spreading for performance.
        return memoizedResultFunc.apply(null, params);
      },
      function (prev: any, next: any, i: number) {
        return prev === next;
      }
    );

    return selector;
  };
  return createSelector;
}

const NOT_FOUND = 'NOT_FOUND';
type NOT_FOUND_TYPE = typeof NOT_FOUND;

interface Entry {
  key: IArguments[];
  value: unknown;
}

interface Cache {
  get(key: unknown): unknown | NOT_FOUND_TYPE;
  put(key: unknown, value: unknown): void;
  getEntries(): Entry[];
  clear(): void;
}

function createSingletonCache(
  equals: ReturnType<typeof createCacheKeyComparator>
): Cache {
  let entry: Entry | undefined;
  return {
    get(key: IArguments[]) {
      if (entry && equals(entry.key, key)) {
        return entry.value;
      }

      return NOT_FOUND;
    },

    put(key: IArguments[], value: unknown) {
      entry = { key, value };
    },

    getEntries() {
      return entry ? [entry] : [];
    },

    clear() {
      entry = undefined;
    }
  };
}

function createCacheKeyComparator(equalityCheck: EqualityFn) {
  return function areArgumentsShallowlyEqual(
    prev: unknown[] | IArguments | null,
    next: unknown[] | IArguments | null
  ): boolean {
    if (prev === null || next === null || prev.length !== next.length) {
      return false;
    }
    // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
    const length = prev.length;
    for (let i = 0; i < length; i++) {
      if (!equalityCheck(prev[i], next[i], i)) {
        return false;
      }
    }

    return true;
  };
}

// defaultMemoize now supports a configurable cache size with LRU behavior,
// and optional comparison of the result value with existing values
export function defaultMemoize<F extends UnknownFunction>(
  func: F,
  equalityCheck: EqualityFn
) {
  const comparator = createCacheKeyComparator(equalityCheck);

  const cache = createSingletonCache(comparator);

  // we reference arguments instead of spreading them for performance reasons
  function memoized() {
    let value = cache.get(arguments);
    if (value === NOT_FOUND) {
      // @ts-ignore
      value = func.apply(null, arguments);
      cache.put(arguments, value);
    }
    return value;
  }

  memoized.clearCache = () => cache.clear();

  return memoized as F & { clearCache: () => void };
}

export const createSelector = createSelectorCreator(defaultMemoize);
