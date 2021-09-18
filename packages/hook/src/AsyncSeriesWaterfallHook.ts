import { IHookOpts } from './types';

export const executeAsyncSeriesWaterfallHook = async (
  tapFns: IHookOpts['fn'][],
  ...args: any[]
) => {
  for (let i = 0; i < tapFns.length; i++) {
    let fn = tapFns[i];
    let promiseResult = await fn(...args);
    if (typeof args[0] !== 'undefined') {
      if (typeof promiseResult !== 'undefined') {
        args[0] = promiseResult;
      } else {
        console.warn(
          `Expected return value from hook "${fn.hookName}" but is undefined`
        );
      }
    }
  }

  return args[0];
};
