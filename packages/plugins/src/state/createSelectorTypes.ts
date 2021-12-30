/*
 *
 * Reselect Data Types
 *
 */

/** A standard selector function, which takes three generic type arguments:
 * @param State The first value, often a Redux root state object
 * @param Result The final result returned by the selector
 * @param Params All additional arguments passed into the selector
 */
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
export type SelectorArray = ReadonlyArray<Selector>;

/** A standard function returning true if two values are considered equal */
export type EqualityFn = (a: any, b: any, i: number) => boolean;

/*
 *
 * Reselect Internal Utility Types
 *
 */

/** Any function with arguments */
export type UnknownFunction = (...args: any[]) => any;

/** Utility type to infer the type of "all params of a function except the first", so we can determine what arguments a memoize function accepts */
export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
  ? U
  : never;
