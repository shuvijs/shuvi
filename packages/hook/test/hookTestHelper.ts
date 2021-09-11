import { IHookOpts } from '../src/types';
import { getHooksFunctions } from '../src/utils';

export const runHook = (
  hooks: IHookOpts<any>[],
  hookExecute: Function,
  ...args: any[]
) => {
  return hookExecute(getHooksFunctions(hooks), ...args);
};
