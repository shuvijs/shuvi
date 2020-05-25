import { IConfig } from '../config';
import Shuvi, { IShuviConstructorOptions } from './shuvi.base';

export { Shuvi };

export interface ShuviOptions {
  dev?: boolean;
  config?: IConfig;
}

export function shuvi({ dev = false, config = {} }: ShuviOptions): Shuvi {
  let ShuviCtor: { new (options: IShuviConstructorOptions): Shuvi };
  if (dev) {
    ShuviCtor = require('./shuvi.dev').default;
  } else {
    ShuviCtor = require('./shuvi.prod').default;
  }

  return new ShuviCtor({ config });
}
