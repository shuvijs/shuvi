import { IHookOpts } from './types';

export const executeAsyncParallelHook = async (
  tapFns: IHookOpts['fn'][],
  ...args: any[]
) => {
  const results = await Promise.all(tapFns.map(fn => fn(...args)));
  return results;
};
