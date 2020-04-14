import path from 'path';
import { IConfig } from '@shuvi/types';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';

export function resolvePlugin(name: string) {
  return path.join(__dirname, 'fixtures', 'plugins', name);
}

export function shuviConfig(config: Partial<IConfig> = {}): IConfig {
  return deepmerge(
    {
      ssr: false,
      env: {},
      rootDir: '/',
      outputPath: 'dist',
      publicPath: '',
      router: {
        history: 'auto',
      },
    },
    config
  );
}
