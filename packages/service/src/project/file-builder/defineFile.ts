import { uuid } from './utils';
import type { FileOption, DefineFile } from './types';

export const defineFile: DefineFile = <T = string, C = any>(
  fileOption: FileOption<T, C>
) => {
  return {
    ...fileOption,
    id: uuid()
  };
};
