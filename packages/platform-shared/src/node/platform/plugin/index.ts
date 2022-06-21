import { createPlugin } from '@shuvi/service';
import { resolveLocal as _resolveLocal } from '@shuvi/utils/lib/resolve';
import * as path from 'path';
import { extendedHooks } from './hooks';

const resolveFile = (...paths: string[]) =>
  path.resolve(__dirname, '..', '..', '..', '..', ...paths);

const resolveLocal = (id: string) => _resolveLocal(id, { basedir: __dirname });

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  // todo: fix types herer
  configWebpack(config: any) {
    config.resolve.alias.set('@shuvi/router$', resolveLocal('@shuvi/router'));
    config.resolve.alias.set('@shuvi/redox$', resolveLocal('@shuvi/redox'));

    return config;
  },
  addRuntimeService: () => [
    {
      // must be lib, because this moudle won't be bundled
      source: resolveFile('lib', 'runtime', 'runtimeConfig'),
      exported: '{ getRuntimeConfig }'
    },
    {
      // todo: rename and limit export modules
      source: resolveFile('esm', 'runtime'),
      exported: '*'
    },
    {
      source: resolveFile('esm', 'runtime', 'appProxy'),
      exported: '{ App }'
    }
  ]
});

export const sharedPlugin = {
  core,
  types: path.join(__dirname, 'types')
};
