import Shuvi, { IShuviConstructorOptions } from './shuvi.base';

export { Shuvi };

export interface ShuviOptions {
  dev?: boolean;
  configFile: string;
}

export function shuvi({ dev = false, configFile }: ShuviOptions): Shuvi {
  let ShuviCtor: { new (options: IShuviConstructorOptions): Shuvi };
  if (dev) {
    ShuviCtor = require('./shuvi.dev').default;
  } else {
    ShuviCtor = require('./shuvi.prod').default;
  }

  return new ShuviCtor({ configFile });
}
