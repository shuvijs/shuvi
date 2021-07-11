import Shuvi, { IShuviConstructorOptions } from './shuvi.base';
import { IConfig } from '../config';

export { Shuvi, IConfig };

export interface ShuviOptions {
  cwd?: string;
  dev?: boolean;
  config?: IConfig;
  configFile?: string;
}

export function shuvi({
  dev = false,
  cwd = '.',
  config = {},
  configFile
}: ShuviOptions): Shuvi {
  let ShuviCtor: { new (options: IShuviConstructorOptions): Shuvi };
  if (dev) {
    ShuviCtor = require('./shuvi.dev').default;
  } else {
    ShuviCtor = require('./shuvi.prod').default;
  }

  return new ShuviCtor({ cwd, config, configFile });
}
