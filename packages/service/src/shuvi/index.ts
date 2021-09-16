import Shuvi, { IShuviConstructorOptions } from './shuvi.base';
import { IConfig } from '../config';
import { Runtime } from '../types';
import { IApiConfig } from '../api';

export { Shuvi, IConfig };

export interface ShuviOptions {
  cwd?: string;
  dev?: boolean;
  config: IApiConfig;
  platform: Runtime.IRuntime;
}

export function shuvi({
  dev = false,
  cwd = '.',
  config,
  platform
}: ShuviOptions): Shuvi {
  let ShuviCtor: { new (options: IShuviConstructorOptions): Shuvi };
  if (dev) {
    ShuviCtor = require('./shuvi.dev').default;
  } else {
    ShuviCtor = require('./shuvi.prod').default;
  }

  return new ShuviCtor({ cwd, config, platform });
}
