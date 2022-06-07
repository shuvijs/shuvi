import { createPlugin } from '@shuvi/service';
import * as path from 'path';
import { extendedHooks } from './hooks';

const runtimeConfigPath = path.resolve(
  __dirname,
  '..',
  '..',
  'lib/runtimeConfig'
);

const core = createPlugin({
  setup: ({ addHooks }) => {
    addHooks(extendedHooks);
  },
  addRuntimeService: () => [
    {
      source: runtimeConfigPath,
      exported: '{ default as getRuntimeConfig }'
    },
    {
      source: path.resolve(__dirname, '..', '..', 'runtime'),
      exported: '*'
    },
    {
      source: path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'esm',
        'runtime',
        'appProxy'
      ),
      exported: '{ App }'
    }
  ]
});

export const sharedPlugin = {
  core,
  types: path.join(__dirname, 'types')
};
