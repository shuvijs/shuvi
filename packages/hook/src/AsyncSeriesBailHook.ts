import { IHookOpts } from './types';

export const executeAsyncSeriesBailHook = async (
  tapFns: IHookOpts['fn'][],
  ...args: any[]
) => {
  let result: unknown = [];

  for (let i = 0; i < tapFns.length; i++) {
    result = tapFns[i](...args);

    if (Promise.resolve(result) === result) {
      result = await result;
    }

    if (result) {
      break;
    }
  }
  return result;
};
