import { uuid } from './utils';
import type { FileOptionWithoutId, DefineFile } from './types';

export const defineFile: DefineFile = <T = string, C = any>(
  fileOption: FileOptionWithoutId<T, C>
) => {
  return {
    ...fileOption,
    id: fileOption.name || uuid()
  };
};
