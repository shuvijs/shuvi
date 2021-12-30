import invariant from '@shuvi/utils/lib/invariant';
import { isObject } from './utils';
import {
  UnknownFunction,
  SelectorArray,
  EqualityFn,
  DropFirst
} from './createSelectorTypes';

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

function createSelectorCreator<
  /** Selectors will eventually accept some function to be memoized */
  F extends (...args: unknown[]) => unknown,
  /** A memoizer such as defaultMemoize that accepts a function + some possible options */
  MemoizeFunction extends (func: F, ...options: any[]) => F,
  /** The additional options arguments to the memoizer */
  MemoizeOptions extends unknown[] = DropFirst<Parameters<MemoizeFunction>>
>(memoize: MemoizeFunction) {
  const createSelector = (...funcs: Function[]) => {
    // Normally, the result func or "output selector" is the last arg
    let resultFunc = funcs.pop();

    const directlyPassedOptions = resultFunc as any;

    invariant(
      isObject(directlyPassedOptions),
      `createSelector expects an object last inputs, but received: [${typeof directlyPassedOptions}]`
    );

    // and pop the real result func off
    resultFunc = funcs.pop();

    invariant(
      typeof resultFunc === 'function',
      `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`
    );

    // Determine which set of options we're using. Prefer options passed directly,
    // but fall back to options given to createSelectorCreator.
    const { equalityCheck } = directlyPassedOptions;

    const dependencies = getDependencies(funcs);

    const memoizedResultFunc = memoize(
      function () {
        // apply arguments instead of spreading for performance.
        return resultFunc!.apply(null, arguments);
      } as F,
      equalityCheck
    );

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    const selector = memoize(
      function () {
        const params = [];
        const length = dependencies.length;

        for (let i = 0; i < length; i++) {
          // apply arguments instead of spreading and mutate a local list of params for performance.
          // @ts-ignore
          params.push(dependencies[i].apply(null, arguments));
        }

        // apply arguments instead of spreading for performance.
        return memoizedResultFunc.apply(null, params);
      } as F,
      function (prev: any, next: any, i: number) {
        return prev === next;
      }
    );

    Object.assign(selector, {
      resultFunc,
      memoizedResultFunc,
      dependencies
    });

    return selector;
  };
  // @ts-ignore
  return createSelector as CreateSelectorFunction<
    F,
    MemoizeFunction,
    MemoizeOptions
  >;
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
