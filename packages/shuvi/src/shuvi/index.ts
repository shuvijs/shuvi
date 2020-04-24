import { IConfig } from '@shuvi/types';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { defaultConfig } from '../config';
import Shuvi, { IShuviConstructorOptions } from './shuvi.base';

export { Shuvi };

export interface ShuviOptions {
  dev?: boolean;
  config: Partial<IConfig>;
}

export function shuvi({ dev = false, config }: ShuviOptions): Shuvi {
  let ShuviCtor: { new (options: IShuviConstructorOptions): Shuvi };
  if (dev) {
    ShuviCtor = require('./shuvi.dev').default;
  } else {
    ShuviCtor = require('./shuvi.prod').default;
  }

  return new ShuviCtor({ config: deepmerge(defaultConfig, config) });
}
