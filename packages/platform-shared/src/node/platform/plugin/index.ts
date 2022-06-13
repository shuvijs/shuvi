import { createPlugin } from '@shuvi/service';
import * as path from 'path';
import { extendedHooks } from './hooks';

const resolveFile = (...paths: string[]) =>
  path.resolve(__dirname, '..', '..', '..', '..', ...paths);

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
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
