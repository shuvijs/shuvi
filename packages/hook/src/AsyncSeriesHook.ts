import { IHookOpts } from './types';

export const executeAsyncSeriesHook = async (
  tapFns: IHookOpts['fn'][],
  ...args: any[]
) => {
  let results: unknown[] = [];

  for (let i = 0; i < tapFns.length; i++) {
    results.push(await tapFns[i](...args));
  }

  return results;
};
